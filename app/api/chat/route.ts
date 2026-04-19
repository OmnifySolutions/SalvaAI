import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { supabaseAdmin } from "@/lib/supabase";
import {
  classifyUrgency,
  detectAppointmentIntent,
  extractContact,
  isAfterHours,
  URGENCY_RANK,
  UrgencyLevel,
} from "@/lib/classify";
import { buildFeatureLayer } from "@/lib/ai-features";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Rate limiting: track message counts per IP in memory (resets on cold start)
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    let body: {
      businessId: string;
      conversationId?: string;
      message: string;
    };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { businessId, conversationId, message } = body;
    if (!businessId || !message || typeof message !== "string") {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (message.length > 1000) {
      return Response.json({ error: "Message too long" }, { status: 400 });
    }

    // Fetch business context
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (bizError || !business) {
      console.error("Business fetch error:", bizError);
      return Response.json({ error: "Business not found" }, { status: 404 });
    }

  // Check interaction limits
  if (business.plan === "free" && business.interaction_count >= 50) {
    return Response.json(
      { error: "Free trial limit (50 interactions) reached. Please upgrade to continue." },
      { status: 403 }
    );
  }
  if (business.plan === "basic" && business.interaction_count >= 500) {
    return Response.json(
      { error: "Monthly interaction limit reached. Please upgrade." },
      { status: 403 }
    );
  }

  // Classify this user message for dashboard metrics.
  const urgency = classifyUrgency(message);
  const appointmentIntent = detectAppointmentIntent(message);
  const contact = extractContact(message);
  const afterHours = isAfterHours(business.hours as never);

  // Get or create conversation
  let convId = conversationId;
  if (!convId) {
    const { data: newConv, error: convError } = await supabaseAdmin
      .from("conversations")
      .insert({
        business_id: businessId,
        channel: "chat",
        status: "active",
        urgency,
        is_after_hours: afterHours,
        appointment_requested: appointmentIntent,
        visitor_phone: contact.phone ?? null,
        visitor_email: contact.email ?? null,
      })
      .select("id")
      .single();
    if (convError || !newConv) {
      return Response.json({ error: "Failed to create conversation" }, { status: 500 });
    }
    convId = newConv.id;
  } else {
    // Verify conversation belongs to this business (security: prevent cross-business access)
    const { data: existing } = await supabaseAdmin
      .from("conversations")
      .select("urgency, appointment_requested, visitor_phone, visitor_email, business_id")
      .eq("id", convId)
      .single();

    if (!existing || existing.business_id !== businessId) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    const newUrgency =
      existing && URGENCY_RANK[urgency] > URGENCY_RANK[(existing.urgency as UrgencyLevel) ?? "routine"]
        ? urgency
        : undefined;

    const patch: Record<string, unknown> = {};
    if (newUrgency) patch.urgency = newUrgency;
    if (appointmentIntent && !existing?.appointment_requested) patch.appointment_requested = true;
    if (contact.phone && !existing?.visitor_phone) patch.visitor_phone = contact.phone;
    if (contact.email && !existing?.visitor_email) patch.visitor_email = contact.email;
    if (Object.keys(patch).length > 0) {
      await supabaseAdmin.from("conversations").update(patch).eq("id", convId);
    }
  }

  // Save user message
  await supabaseAdmin.from("messages").insert({
    conversation_id: convId,
    role: "user",
    content: message,
  });

  // Fetch conversation history (last 10 messages)
  const { data: history } = await supabaseAdmin
    .from("messages")
    .select("role, content")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true })
    .limit(10);

  const faqText =
    business.faqs && business.faqs.length > 0
      ? business.faqs
          .map((f: { question: string; answer: string }) => `Q: ${f.question}\nA: ${f.answer}`)
          .join("\n\n")
      : "No FAQs configured yet.";

  type HoursEntry = { open: string | null; close: string | null; enabled: boolean };
  const hoursText = typeof business.hours === "string"
    ? business.hours
    : Object.entries(business.hours as Record<string, HoursEntry> ?? {})
        .filter(([, v]) => v.enabled)
        .map(([day, v]) => `${day}: ${v.open}–${v.close}`)
        .join(", ") || "Please call us for our hours.";

  const servicesText = Array.isArray(business.services)
    ? business.services.map((s: { name: string }) => s.name).join(", ")
    : (business.services as string) || "Please call us to learn about our services.";

  const dosText = business.ai_dos
    ? `DO: ${business.ai_dos.split('\n').filter(Boolean).join('\n• ')}`
    : '';
  const dontsText = business.ai_donts
    ? `DON'T: ${business.ai_donts.split('\n').filter(Boolean).join('\n• ')}`
    : '';

  // Special handling for SalvaAI's own demo chatbot
  const isSalvaAIDemo = businessId === process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID;

  const systemPrompt = isSalvaAIDemo
    ? getSalvaAISystemPrompt()
    : `You are a friendly AI receptionist named ${business.ai_name ?? "Claire"} for ${business.name}, a ${business.business_type}.

Your job is to help patients/clients by answering common questions, providing information, and helping them schedule appointments.

Business Hours: ${hoursText}
Services: ${servicesText}

Frequently Asked Questions:
${faqText}

${dosText ? `\nCustom Guidelines:\n${dosText}\n${dontsText}` : ''}
${buildFeatureLayer(business.ai_features ?? [])}
Important rules:
- Keep responses concise (2-4 sentences max)
- Never collect or store personal health information (PHI)
- If someone needs urgent medical attention, direct them to call 911 or go to the ER
- For appointment scheduling, ask them to call the office or provide your scheduling link if available
- Be warm, professional, and helpful
- If you don't know the answer, say so and suggest they call the office directly`;

  const messages = (history ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  let replyText: string;

  // Try Groq first (free), fall back to Anthropic, then mock
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 256,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });
    replyText =
      response.choices[0]?.message?.content ||
      "I'm sorry, I couldn't process that.";
  } catch (groqErr: unknown) {
    console.warn("Groq failed, trying Anthropic:", groqErr);
    try {
      if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes("REPLACE")) {
        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 256,
          system: systemPrompt,
          messages,
        });
        replyText =
          response.content[0].type === "text"
            ? response.content[0].text
            : "I'm sorry, I couldn't process that.";
      } else {
        throw new Error("Anthropic not configured");
      }
    } catch (anthropicErr: unknown) {
      console.warn("Anthropic failed, using mock response:", anthropicErr);
      replyText = getMockResponse(message, isSalvaAIDemo);
    }
  }

  // Save assistant message
  await supabaseAdmin.from("messages").insert({
    conversation_id: convId,
    role: "assistant",
    content: replyText,
  });

  // Increment interaction count
  await supabaseAdmin
    .from("businesses")
    .update({ interaction_count: business.interaction_count + 1 })
    .eq("id", businessId);

    return Response.json({ reply: replyText, conversationId: convId });
  } catch (err) {
    console.error("Chat API error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

function getSalvaAISystemPrompt(): string {
  return `You are a knowledgeable SalvaAI team member helping dental practices understand and use our AI receptionist platform. You represent the SalvaAI brand and are an expert on our product.

**About SalvaAI:**
SalvaAI is an AI receptionist and chat widget platform built specifically for dental practices. We handle calls, chats, and bookings 24/7 so practices never miss a new patient.

**Our Pricing Plans:**
- **Free** ($0, forever): 50 AI interactions total, chat widget with SalvaAI branding, basic FAQ support. Perfect for testing.
- **Basic** ($69/month): Unlimited interactions, chat widget with no branding, custom AI name & greeting, FAQ management, conversation history, email support.
- **Pro** ($219/month, most popular): Everything in Basic + AI voice phone answering, up to 500 calls/month, custom AI instructions, priority support.
- **Multi-Practice** ($749/month): Everything in Pro for up to 5 locations, up to 2,500 calls/month, centralized dashboard, dedicated onboarding support.

**Key Features:**
1. **24/7 Voice AI Receptionist** - Answers every call in the practice's tone, handles FAQs, office hours, parking directions, appointment questions. Supports barge-in and custom greetings.
2. **Insurance Checker** - Patients ask "Do you take my insurance?" and Salva checks your accepted list immediately. Pre-trained and includes Medicaid routing.
3. **New Patient Booking** - Walks patients through intake questions, pitches new patient specials, books directly into the practice's calendar.
4. **AI Chat Widget** - Fully customizable and brandable. Can be embedded on any website.
5. **Real-Time Dashboard** - Monitor all calls and chats in real time. Track metrics like patient contact, appointment requests, after-hours coverage, urgency levels.
6. **Practice Management Integration** - Bi-directional sync with Open Dental (fully integrated), Dentrix & Eaglesoft (waitlist integration). Real-time patient record lookups.
7. **Custom AI Instructions** - Practices can customize AI behavior with custom do's and don'ts that affect responses.
8. **Multi-Location Support** - Manage all locations from one dashboard.

**Setup & Support:**
- Setup takes just 2 minutes - copy one line of code to your website
- 14-day free trial on all paid plans, no credit card required
- Cancel anytime, no contracts or fees
- Email support on Basic+, priority support on Pro+
- Dedicated onboarding on Multi-Practice

**Security & Compliance:**
- HIPAA-compliant
- Never collects or stores personal health information (PHI)
- Business Associate Agreement (BAA) available on Pro and Multi-Practice plans
- Data is secure and encrypted

**Important Behaviors:**
- Be friendly, professional, and concise (2-4 sentences per response)
- When asked about pricing, clearly explain the tier differences and what's included
- Highlight key differentiators: fast setup (2 min vs competitors' hours), custom AI instructions, multi-location support, dedicated support
- Guide users to start the free trial at salvaai.com/sign-up
- Direct technical questions to the dashboard or support email
- If users mention specific dental integrations, explain our Open Dental partnership and waitlist integration for others
- Emphasize that Salva handles after-hours calls, captures new patient info, and books appointments directly - solving the #1 problem: missed calls
- If someone wants to schedule a demo or have a conversation, direct them to start a free trial or email support`;
}

function getMockResponse(message: string, isSalvaAIDemo = false): string {
  const lower = message.toLowerCase();

  if (isSalvaAIDemo) {
    if (lower.includes("price") || lower.includes("cost") || lower.includes("how much") || lower.includes("plan")) {
      return "Salva AI offers four plans: Free ($0, 50 interactions), Basic ($69/mo, unlimited chat), Pro ($219/mo, voice AI + up to 500 calls), and Multi-Practice ($749/mo, up to 5 locations). All paid plans include a 14-day free trial.";
    }
    if (lower.includes("voice") || lower.includes("call") || lower.includes("phone")) {
      return "Voice AI is available on our Pro plan ($219/mo). It answers every call 24/7 in your practice's tone, handles FAQs, and supports barge-in with custom greetings. Up to 500 calls/month included.";
    }
    if (lower.includes("setup") || lower.includes("start") || lower.includes("how do i")) {
      return "Getting started takes about 2 minutes — sign up, copy one line of code to your website, and you're live. No developer or IT team needed. Start your free trial at salvaai.com/sign-up.";
    }
    if (lower.includes("integration") || lower.includes("open dental") || lower.includes("dentrix")) {
      return "Salva AI integrates directly with Open Dental (fully supported) and has waitlist integrations for Dentrix and Eaglesoft. It syncs in real time so your AI always knows your true availability.";
    }
    if (lower.includes("hipaa") || lower.includes("privacy") || lower.includes("secure") || lower.includes("data")) {
      return "Salva AI is HIPAA-compliant and never stores personal health information. A Business Associate Agreement (BAA) is available on Pro and Multi-Practice plans.";
    }
    return "I'm a SalvaAI team member — happy to help! You can ask me about pricing, features, voice AI, integrations, or how to get started. What would you like to know?";
  }

  if (lower.includes("hour") || lower.includes("open")) {
    return "We're open Monday through Friday, 9am to 5pm, and Saturday 9am to 1pm. We're closed Sundays. Would you like to schedule an appointment?";
  }
  if (lower.includes("appointment") || lower.includes("schedule") || lower.includes("book")) {
    return "I'd be happy to help you schedule an appointment! Please call our office directly at the number on our website, and our team will find a time that works for you.";
  }
  if (lower.includes("insurance") || lower.includes("accept")) {
    return "We accept most major dental insurance plans including Delta Dental, Cigna, Aetna, and MetLife. Please call our office to verify your specific coverage.";
  }
  if (lower.includes("cost") || lower.includes("price") || lower.includes("how much")) {
    return "Costs vary depending on the treatment needed. We offer free consultations so we can give you an accurate estimate. Would you like to schedule one?";
  }
  return "Thank you for reaching out! I'm here to help answer your questions. For the most accurate information or to schedule an appointment, please don't hesitate to ask or call our office directly.";
}
