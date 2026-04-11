import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
    return Response.json({ error: "Business not found" }, { status: 404 });
  }

  // Check interaction limit for basic plan
  if (business.plan === "basic" && business.interaction_count >= 500) {
    return Response.json(
      { error: "Monthly interaction limit reached. Please upgrade." },
      { status: 403 }
    );
  }

  // Get or create conversation
  let convId = conversationId;
  if (!convId) {
    const { data: newConv, error: convError } = await supabaseAdmin
      .from("conversations")
      .insert({ business_id: businessId, channel: "chat", status: "active" })
      .select("id")
      .single();
    if (convError || !newConv) {
      return Response.json({ error: "Failed to create conversation" }, { status: 500 });
    }
    convId = newConv.id;
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

  const systemPrompt = `You are a friendly AI receptionist for ${business.business_name}, a ${business.business_type}.

Your job is to help patients/clients by answering common questions, providing information, and helping them schedule appointments.

Business Hours: ${business.hours || "Please call us for our hours."}
Services: ${business.services || "Please call us to learn about our services."}

Frequently Asked Questions:
${faqText}

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

  // Use mock response if no real API key configured
  let replyText: string;
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes("REPLACE")) {
    replyText = getMockResponse(message);
  } else {
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
}

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
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
