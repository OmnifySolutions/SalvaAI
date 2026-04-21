import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/components/Logo";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Rocket,
  PhoneCall,
  MessageSquare,
  Sliders,
  Zap,
  Bell,
  CreditCard,
  ShieldCheck,
  Database,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ — Salva AI | Dental AI Receptionist",
  description:
    "Answers to every question about Salva AI — the AI receptionist built for dental practices. Setup, voice AI, integrations, pricing, HIPAA, data, and more.",
  alternates: { canonical: "/faq" },
};

type QA = { q: string; a: string };
type Category = { id: string; label: string; icon: LucideIcon; questions: QA[] };

const CATEGORIES: Category[] = [
  {
    id: "product",
    label: "Product Overview",
    icon: Bot,
    questions: [
      {
        q: "What is Salva AI?",
        a: "Salva AI is an AI-powered receptionist platform built specifically for dental practices. It answers phone calls and chat messages on your behalf — 24 hours a day, 7 days a week — handling appointment inquiries, patient questions, emergency triage, and more. It connects directly to your practice management system (starting with Open Dental) to assist with scheduling, and surfaces all important conversations in a single dashboard inbox.",
      },
      {
        q: "Is Salva AI just a chatbot?",
        a: "No. Salva AI includes both a website chat widget and a full voice AI phone agent. The voice agent answers inbound calls, carries on natural conversations, handles after-hours callers, detects dental emergencies, and can assist with booking requests — all by phone. The chat widget provides the same intelligence on your website.",
      },
      {
        q: "Which types of dental practices is it built for?",
        a: "Salva AI is built exclusively for dental practices — general dental, orthodontics, oral surgery, and pediatric dentistry. It is not a generic small-business tool; every feature, prompt, and workflow is designed around the dental patient journey and front-desk experience.",
      },
      {
        q: "Does the AI know about my specific practice?",
        a: "Yes. During setup you configure your practice name, specialty, business hours, services with durations, accepted insurance, custom greeting, AI name, system prompt, and patient FAQs. The AI uses all of this information in every conversation. You can also write explicit Do's and Don'ts — plain English rules the AI follows on every call and chat.",
      },
      {
        q: "Is there a mobile app?",
        a: "Salva AI is a web-based platform. Your dashboard, inbox, settings, and analytics are accessible from any device — phone, tablet, or desktop — through your browser. There is no separate mobile app at this time.",
      },
      {
        q: "Can I use Salva AI for multiple practice locations?",
        a: "Yes. The Multi-Practice plan is designed specifically for organizations with multiple locations. It allows you to manage all sites from a single centralized dashboard, with custom routing rules and unified reporting for your entire group.",
      },
      {
        q: "Can I try Salva AI before committing?",
        a: "Yes. The Free plan gives you 50 lifetime interactions at no cost and with no credit card required — so you can test the chat widget and explore the dashboard before upgrading. Paid plans also include a 14-day free trial. You will not be charged until the trial ends.",
      },
    ],
  },
  {
    id: "setup",
    label: "Setup & Onboarding",
    icon: Rocket,
    questions: [
      {
        q: "How long does setup take?",
        a: "Most practices are fully configured in under 5 minutes. The onboarding wizard walks you through your practice profile, services, AI name and greeting, and basic customization. You can refine settings at any time from the Settings dashboard — no developer needed.",
      },
      {
        q: "Do I need technical knowledge to set up Salva AI?",
        a: "No. Everything is configured through a point-and-click dashboard. The most technical step is pasting an embed snippet to add the chat widget to your website — which typically takes 30 seconds and can be done by your front desk or webmaster. For the voice AI, a virtual phone number is provisioned for you automatically.",
      },
      {
        q: "What information do I need to get started?",
        a: "To complete setup you will need: your practice name, specialty, business hours, the services you offer (with approximate appointment durations), and optionally your custom AI greeting and patient FAQs. If you want to connect Open Dental, you will also need your Open Dental server URL and API key.",
      },
      {
        q: "Can I customize the AI's name?",
        a: "Yes. You can name your AI agent anything you like. Most practices choose a human-sounding first name (e.g., Claire, Jordan, Alex). The name is used in greetings and is what patients hear when the phone is answered.",
      },
      {
        q: "Can I add my own FAQ answers?",
        a: "Yes. In the AI Configuration settings tab you can add any number of patient FAQs. Each FAQ is a question-and-answer pair. The AI will use these as authoritative answers whenever a patient asks a matching question — for example, 'Do you accept Medicaid?', 'What's the parking situation?', or 'Do you see kids?'",
      },
      {
        q: "How do I add the chat widget to my website?",
        a: "From your dashboard, copy the embed snippet and paste it before the closing </body> tag in your website's HTML. If you use a website builder like Squarespace, Wix, or WordPress, this is done through the 'Custom Code' or 'Header/Footer Code' settings. The widget appears as a floating button in the corner of your website.",
      },
      {
        q: "Can I change settings after going live?",
        a: "Yes. All settings — AI name, greeting, hours, services, features, Do's & Don'ts, voice tone, notification contacts — can be updated at any time from the Settings page. Changes take effect immediately on the next conversation.",
      },
    ],
  },
  {
    id: "voice",
    label: "Voice AI",
    icon: PhoneCall,
    questions: [
      {
        q: "How does the voice AI work?",
        a: "When a patient calls your practice's virtual number, Salva AI answers the call in real time. It listens to what the patient says, understands the intent, and responds naturally — just like a trained front desk agent. It can handle appointment requests, after-hours inquiries, insurance questions, emergency detection, and more. If a topic requires human attention, it can transfer the call or log a callback request.",
      },
      {
        q: "What phone number do I get?",
        a: "When you sign up for a voice-enabled plan (Pro or Multi-Practice), a virtual phone number is automatically provisioned for your practice. This is the number you forward your existing practice line to, or use as a dedicated AI line. Your patients call it like any other phone number.",
      },
      {
        q: "Do patients know they're talking to an AI?",
        a: "Salva AI does not impersonate a human and should not be configured to do so — this is a requirement of our Terms of Service. You can choose how explicit the AI is: some practices set the greeting to 'Hi, you've reached Bright Smiles — I'm Claire, an AI assistant' while others prefer 'Hi, this is Claire from Bright Smiles.' We recommend transparency. The AI never claims to be a licensed healthcare professional.",
      },
      {
        q: "What voice tones are available?",
        a: "You can choose from three acoustic tones: Professional & Efficient (direct, minimal small talk — great for busy general dental practices), Warm & Friendly (conversational and encouraging — ideal for pediatric or family practices), and Clinical & Precise (formal, medically oriented — preferred by oral surgeons and specialists). The tone affects phrasing, pacing, and response style across all voice conversations.",
      },
      {
        q: "What happens when I'm closed?",
        a: "With After-Hours Handling enabled, the AI stays active during your closed hours and tells callers you are currently closed — then offers to take their question, collect their callback number, or add them to a waitlist. All after-hours conversations appear in your dashboard the next morning. Without this feature, the AI still answers but responds as if the office is open.",
      },
      {
        q: "Can the AI transfer calls to a human?",
        a: "Yes. The Smart Handoffs feature lets you define specific call types that should always be transferred to your front desk instead of handled by the AI — for example, insurance inquiries, appointment requests, or any clinical question. You can enable or disable each handoff type from Voice Settings.",
      },
      {
        q: "How does the AI handle dental emergencies?",
        a: "With the Emergency Detection feature enabled, the AI identifies key phrases and scenarios that indicate a dental emergency — severe pain, knocked-out tooth, facial swelling, uncontrolled bleeding. It flags the conversation as an emergency, offers the patient your emergency contact number, and immediately notifies your team via SMS, email, or WhatsApp. The emergency also appears at the top of your dashboard Inbox under 'Emergencies.'",
      },
      {
        q: "What if a patient talks over the AI (barge-in)?",
        a: "Salva AI handles barge-in gracefully. If a patient starts speaking while the AI is responding, the AI stops and listens. A 150ms debounce filter prevents false triggers from background noise or short sounds. The AI waits for the patient to complete a meaningful phrase before responding.",
      },
      {
        q: "What if the AI says something wrong?",
        a: "The AI can occasionally misunderstand or produce imperfect responses. You can review all conversation transcripts from your dashboard and refine your settings, FAQs, Do's & Don'ts, or system prompt to improve accuracy over time. You are also responsible under our Terms of Service for reviewing and configuring the AI's behavior — it is a supplementary tool, not a replacement for trained staff.",
      },
    ],
  },
  {
    id: "chat",
    label: "Chat Widget",
    icon: MessageSquare,
    questions: [
      {
        q: "What does the chat widget do?",
        a: "The chat widget is a floating button embedded on your practice website. When patients click it, they can type questions and receive instant answers from the AI — about services, hours, insurance, booking, pricing (if enabled), and more. All conversations are logged in your dashboard Inbox and analytics.",
      },
      {
        q: "Does the chat widget work on mobile?",
        a: "Yes. The widget is fully responsive and works on mobile browsers, tablets, and desktops.",
      },
      {
        q: "Can I customize how the widget looks?",
        a: "Basic customization (AI name, greeting) is available now. Advanced widget theming — custom colors, positioning, and branding — is on the product roadmap.",
      },
      {
        q: "Is the chat widget included in all plans?",
        a: "Yes. The chat widget is included in every plan, including the Free plan (with a 50-interaction lifetime limit). Voice AI is only available on Pro and Multi-Practice plans.",
      },
      {
        q: "What happens when a patient asks something outside the AI's knowledge?",
        a: "If the AI cannot answer confidently based on your configured information, it acknowledges this and directs the patient to call your front desk for assistance. It will not make up information or guess at clinical facts.",
      },
    ],
  },
  {
    id: "customization",
    label: "AI Configuration",
    icon: Sliders,
    questions: [
      {
        q: "What are Do's and Don'ts?",
        a: "Do's and Don'ts are plain English rules you write — one per line — that the AI follows in every conversation. Do's are things the AI should always do (e.g., 'Always ask for the patient's preferred callback time'). Don'ts are things it should never do (e.g., 'Never quote exact prices over the phone'). These rules are applied to both voice calls and chat conversations, on top of all other configuration.",
      },
      {
        q: "What is the System Prompt?",
        a: "The System Prompt is direct operating instructions for the AI — like a training document. You can use it to set tone, define specific workflows, or add context the AI should always have. Example: 'When a patient mentions they are a new patient, always ask if they have dental insurance and what their preferred appointment day is.' Most practices get excellent results without touching the system prompt by using Do's & Don'ts and FAQs instead.",
      },
      {
        q: "How specific can my Do's and Don'ts be?",
        a: "Very specific. You can write rules like 'If a patient mentions Dr. Smith by name, tell them he is available Tuesday and Thursday afternoons' or 'Do not book appointments the same day the patient calls — always schedule for the next available slot 24+ hours out.' One rule per line, plain English.",
      },
      {
        q: "Does customization affect both voice and chat?",
        a: "Yes. All configuration — system prompt, Do's & Don'ts, FAQs, AI features — is applied uniformly to both voice calls and chat conversations. You configure once and it applies everywhere.",
      },
      {
        q: "Can I give the AI specific service information?",
        a: "Yes. In the Services tab you can define every service you offer, including the appointment duration in minutes. The AI uses service duration information when discussing scheduling and availability, and when interacting with Open Dental for booking.",
      },
    ],
  },
  {
    id: "features",
    label: "AI Features",
    icon: Zap,
    questions: [
      {
        q: "What are the 8 AI Features?",
        a: "There are 8 toggleable AI features across three groups: Booking & Availability (Instant Booking, After-Hours Handling, Waitlist Offers), Clinical & Triage (Emergency Detection, Insurance Questions, New Patient Flow), and Financial (Pricing Transparency, Payment Plans). Each feature injects specialized behavior into the AI's responses for both voice and chat.",
      },
      {
        q: "What does Instant Booking do?",
        a: "When Instant Booking is ON, the AI can autonomously book appointments directly into your Open Dental schedule in real time, during the conversation. When OFF, the AI collects the patient's preferred time and name, then queues a booking request for your team to confirm — no direct calendar writes. This is controlled by the ai_features toggle and automatically sets the Open Dental booking mode accordingly.",
      },
      {
        q: "What does After-Hours Handling do?",
        a: "When ON, the AI tells callers outside business hours that the office is closed, stays helpful, and offers to take a message, collect a callback number, or add the patient to a waitlist. When OFF, the AI does not differentiate between business hours and after-hours — it responds the same regardless of time.",
      },
      {
        q: "What does Waitlist Offers do?",
        a: "When ON and a patient asks about a fully-booked time slot, the AI proactively offers to add them to your cancellation waitlist. If a slot opens up, they are the first to know. When OFF, the AI simply tells the patient the slot is unavailable.",
      },
      {
        q: "What does Emergency Detection do?",
        a: "When ON, the AI identifies dental emergency signals in the conversation (severe pain, facial swelling, knocked-out tooth, uncontrolled bleeding) and flags the conversation as an emergency — alerting your team immediately and offering the patient your emergency contact. When OFF, the AI handles these situations like any other inquiry and does not escalate.",
      },
      {
        q: "What does Insurance Questions do?",
        a: "When ON, the AI will discuss insurance acceptance, in-network status, and general coverage information based on what you've configured. When OFF, the AI redirects all insurance questions to your front desk.",
      },
      {
        q: "What does New Patient Flow do?",
        a: "When ON, the AI recognizes first-time patient calls and walks them through what to expect — explaining your new patient exam process, approximate duration, and what to bring. It also collects their contact information to streamline their first visit. When OFF, the AI books them without any special onboarding flow.",
      },
      {
        q: "What does Pricing Transparency do?",
        a: "When ON, the AI will share approximate price ranges for common procedures (e.g., crowns, cleanings, root canals) and mention that insurance may cover a portion. Pricing is presented as approximate ranges, not guarantees. When OFF, the AI redirects all pricing questions to the front desk.",
      },
      {
        q: "What does Payment Plans do?",
        a: "When ON, the AI acknowledges that cost can be a barrier and mentions that your practice offers flexible payment plan options — encouraging the patient to schedule a consultation to discuss. When OFF, the AI does not volunteer payment plan information.",
      },
    ],
  },
  {
    id: "inbox",
    label: "Inbox & Notifications",
    icon: Bell,
    questions: [
      {
        q: "What is the Inbox?",
        a: "The Inbox is a section of your dashboard that surfaces the conversations that need human attention — grouped into three tabs: Emergencies, Pending Bookings, and Callbacks. Items remain in the Inbox until your team marks them resolved. The Inbox updates in real time using Supabase Realtime — no page refresh needed.",
      },
      {
        q: "How do emergency notifications work?",
        a: "When Emergency Detection is enabled and a patient triggers it, Salva AI simultaneously: (1) flags the conversation in the Inbox under Emergencies, and (2) sends notifications to your configured channels — SMS, email, and/or WhatsApp. The notification includes the patient's name and a summary of what was said.",
      },
      {
        q: "What notification channels are supported?",
        a: "Three channels: SMS (via Twilio), Email (via Resend), and WhatsApp (via Twilio WhatsApp). You can configure a phone number and email address for emergency alerts, and enable/disable booking and callback notifications separately. All channels are optional — the Inbox always captures items even if no external alerts are configured.",
      },
      {
        q: "Do I need a Twilio account for notifications?",
        a: "Twilio is used for SMS and voice. A Twilio account is required for voice AI (your virtual number is provisioned through Twilio) and for SMS/WhatsApp notifications. Twilio trial accounts work but include a watermark on calls. For production use, a paid Twilio account is recommended.",
      },
      {
        q: "Can multiple team members receive notifications?",
        a: "Currently, notifications are sent to the contacts configured in Settings > Notifications. Support for multiple notification recipients and team roles is on the roadmap.",
      },
      {
        q: "What is a Callback Request?",
        a: "A callback request is logged when a patient indicates during a conversation that they would prefer to be called back rather than continue chatting or leaving a voicemail. These appear in the Inbox under the Callbacks tab.",
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing & Billing",
    icon: CreditCard,
    questions: [
      {
        q: "What plans are available?",
        a: "There are four plans: Free (50 lifetime interactions, chat only), Basic ($69/month, chat AI + up to 500 interactions/month), Pro ($219/month, voice + chat, up to 2,000 interactions/month, BAA available), and Multi-Practice ($749/month, unlimited locations, custom volume, custom BAA). See the Pricing page for the full comparison.",
      },
      {
        q: "What counts as an 'interaction'?",
        a: "An interaction is a single message exchanged between a patient and your AI — one question and one AI response counts as one interaction. Voice calls are counted by the number of turns in the conversation. Typical conversations are 3–10 interactions.",
      },
      {
        q: "Is there a free trial?",
        a: "Yes. The Free plan gives 50 lifetime interactions with no card required. All paid plans include a 14-day free trial — you will not be charged until the trial ends. If you cancel before the trial ends, you owe nothing.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards via Stripe. No invoicing or net-terms billing is available at this time.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. You can cancel from your dashboard at any time. You retain access until the end of your current billing period. No refunds are issued for unused portions of a billing period.",
      },
      {
        q: "Do you offer refunds?",
        a: "We do not offer refunds for partial months or unused months. If you believe you were charged in error, contact support@getgetsalvaai.com and we will investigate promptly.",
      },
      {
        q: "What happens if I go over my interaction limit?",
        a: "If you exceed your monthly interaction limit, new conversations will be paused until your next billing cycle or until you upgrade. You will receive a notification before hitting the limit.",
      },
      {
        q: "Can I change plans?",
        a: "Yes. You can upgrade or downgrade at any time from your dashboard. Upgrades take effect immediately. Downgrades take effect at the next billing cycle.",
      },
    ],
  },
  {
    id: "hipaa",
    label: "HIPAA & Compliance",
    icon: ShieldCheck,
    questions: [
      {
        q: "Is Salva AI HIPAA compliant?",
        a: "Salva AI is designed with HIPAA compliance principles in mind — including data minimization, encryption in transit (TLS 1.2+) and at rest (AES-256), access controls, and breach notification procedures. There is no official 'HIPAA certification' — compliance is an ongoing practice. Our AI agents are specifically designed to avoid collecting Protected Health Information (PHI).",
      },
      {
        q: "Will the AI collect patient health information?",
        a: "No. Salva AI is explicitly designed and instructed never to collect, store, or ask for clinical information — including diagnoses, treatment histories, health conditions, medications, or lab results. If a patient brings up clinical concerns, the AI redirects them to contact the practice directly.",
      },
      {
        q: "What if a patient shares health information voluntarily?",
        a: "If a patient spontaneously discloses health information, the AI is configured to acknowledge it and redirect to clinical staff rather than engage. Any inadvertently received PHI is treated with the same protections described in our BAA and Privacy Policy.",
      },
      {
        q: "Do I need a Business Associate Agreement (BAA)?",
        a: "Not necessarily — since Salva AI is designed to avoid PHI, many practices may not require a BAA. However, if your compliance officer or legal counsel recommends one, we offer BAAs on Pro and Multi-Practice plans. BAAs are not available on Free or Basic plans.",
      },
      {
        q: "How do I request a BAA?",
        a: "Email support@getgetsalvaai.com with your practice name and plan type. We will send you our standard BAA (based on the HHS model template) for review within 1 business day. Multi-Practice plans can also request custom BAA review.",
      },
      {
        q: "Is Salva AI TCPA compliant?",
        a: "Salva AI only handles inbound calls — patients call your number, the AI answers. It does not make outbound calls or send unsolicited messages. You are responsible for ensuring your use of the voice AI complies with all applicable telecommunications laws, including the TCPA. See our Terms of Service Section 5A for details.",
      },
      {
        q: "Does Salva AI train its AI models on my data?",
        a: "No. We do not use your conversation data or practice configuration to train any general-purpose AI models. Your data is used solely to provide the Service to you.",
      },
    ],
  },
  {
    id: "data",
    label: "Data & Privacy",
    icon: Database,
    questions: [
      {
        q: "Where is my data stored?",
        a: "All data is stored on servers located in the United States. We use Supabase for database infrastructure. Data is encrypted at rest using AES-256 and in transit using TLS 1.2+.",
      },
      {
        q: "Who can access my practice's conversation data?",
        a: "Only your account and authorized team members can access your conversation data through the dashboard. Salva AI staff may access data for support and operational purposes, subject to strict internal controls.",
      },
      {
        q: "Can I export my data?",
        a: "Yes. You may request an export of your practice data and conversation history at any time by contacting support@getgetsalvaai.com. We will provide the export before any account deletion.",
      },
      {
        q: "How long is my data retained?",
        a: "Account and conversation data is retained as long as your account is active. Upon account deletion, practice configuration and conversation transcripts are deleted within 30 days. Billing records are retained as required by financial regulations (up to 7 years). Aggregated, anonymized analytics data may be retained indefinitely.",
      },
      {
        q: "What happens to my data if I cancel?",
        a: "Your account remains accessible until the end of your billing period. After that, your data enters a 30-day deletion window. You can request an export before deletion. Contact support@getgetsalvaai.com to initiate data deletion or export.",
      },
      {
        q: "Does Salva AI sell my data?",
        a: "No. We do not sell, rent, or trade your personal information or your patients' information to any third party for marketing or any other purpose.",
      },
      {
        q: "What third-party services does Salva AI use?",
        a: "We use: Clerk (authentication), Supabase (database), Stripe (payments), Groq (AI model processing), Twilio (voice and SMS), Resend (email notifications), and Vercel (hosting). Each provider processes data under their own privacy policies and security practices. See our Privacy Policy for links to each.",
      },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Zap,
    questions: [
      {
        q: "Which practice management systems does Salva AI integrate with?",
        a: "Open Dental is our primary supported integration, with live scheduling and patient record sync. Eaglesoft, Dentrix, Curve Dental, Carestream, Dolphin Management, and Fuse are on the waitlist — you can join the waitlist from the Integrations tab in your settings.",
      },
      {
        q: "What can Salva AI do with Open Dental?",
        a: "With the Open Dental integration enabled, Salva AI can: check appointment availability in real time, autonomously book appointments (with Instant Booking ON), or queue booking requests for your team to confirm (Instant Booking OFF). Future capabilities include reading patient records for more personalized responses.",
      },
      {
        q: "How do I connect Open Dental?",
        a: "From your dashboard, go to Settings > Integrations. Enter your Open Dental server endpoint URL and your Developer API key. Click 'Test Sync' to verify the connection. Once connected, the integration is live — no restart or support ticket needed.",
      },
      {
        q: "Does Salva AI work without a PMS integration?",
        a: "Yes. Without a PMS integration, the AI can still handle all inquiries, collect booking requests, detect emergencies, and surface everything in your Inbox. Booking requests will appear as pending items for your team to manually schedule. The AI is fully functional as a triage and communication layer even without direct calendar access.",
      },
      {
        q: "Is Salva AI responsible for scheduling errors from integrations?",
        a: "No. Salva AI is not responsible for data loss, scheduling conflicts, or failures originating from third-party software. You are responsible for verifying that appointment data synced through integrations is accurate. See Terms of Service Section 7.",
      },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: HelpCircle,
    questions: [
      {
        q: "How do I get help?",
        a: "Email support@getgetsalvaai.com for any questions or issues. We aim to respond within 1 business day. For urgent matters, include 'URGENT' in the subject line.",
      },
      {
        q: "Is there an onboarding call available?",
        a: "Multi-Practice plan subscribers receive dedicated compliance onboarding. For Pro subscribers, setup is self-serve with full documentation. We are available by email for any setup questions.",
      },
      {
        q: "What if I find a bug or the AI behaves unexpectedly?",
        a: "Email support@getgetsalvaai.com with a description of the issue and, if possible, the conversation transcript. We treat accuracy and reliability as critical — you will receive a timely response.",
      },
      {
        q: "Where can I find release notes and product updates?",
        a: "Major updates are communicated via email to registered users. Follow us for announcements. You can also check your dashboard for any in-app notifications.",
      },
      {
        q: "What is the uptime SLA?",
        a: "We do not publish a formal uptime SLA at this time. We use Vercel for hosting and Supabase for infrastructure, both of which maintain high availability. For enterprise reliability requirements, contact us to discuss the Multi-Practice plan.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "var(--font-geist-sans)" }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo width={110} height={27} />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
              <Link href="/how-it-works" className="hover:text-gray-800 transition-colors">How it works</Link>
              <Link href="/pricing" className="hover:text-gray-800 transition-colors">Pricing</Link>
              <Link href="/faq" className="text-gray-900 font-medium">FAQ</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 transition-colors">Sign in</Link>
            <Link href="/sign-up" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium">
              Get started free
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative bg-gray-950 py-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="w-[900px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/4 animate-glow-float" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Help Center
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Salva AI — from setup to HIPAA compliance, voice AI, integrations, and billing.
          </p>
        </div>
      </section>

      {/* Category nav */}
      <div className="border-b border-gray-100 bg-white sticky top-[65px] z-40">
        <div className="max-w-6xl mx-auto px-6 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                <cat.icon size={14} />
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-20">
        {CATEGORIES.map((cat) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <cat.icon size={20} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{cat.label}</h2>
            </div>
            <div className="space-y-0 divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
              {cat.questions.map((qa, i) => (
                <details key={i} className="group bg-white">
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer select-none hover:bg-gray-50 transition-colors list-none">
                    <span className="font-semibold text-gray-900 text-sm leading-snug">{qa.q}</span>
                    <span className="text-gray-400 shrink-0 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {qa.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        {/* Still have questions */}
        <section className="bg-gray-950 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-black text-white mb-3">Still have questions?</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Our team responds to all inquiries within 1 business day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@getgetsalvaai.com"
              className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-sm"
            >
              Email support@getgetsalvaai.com
            </a>
            <Link
              href="/sign-up"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Get started free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Logo width={100} height={26} />
          </Link>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/how-it-works" className="hover:text-gray-600 transition-colors">How it works</Link>
            <Link href="/pricing" className="hover:text-gray-600 transition-colors">Pricing</Link>
            <Link href="/faq" className="hover:text-gray-600 transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <Link href="/baa" className="hover:text-gray-600 transition-colors">BAA</Link>
          </div>
          <span>© {new Date().getFullYear()} Salva AI</span>
        </div>
      </footer>
    </div>
  );
}
