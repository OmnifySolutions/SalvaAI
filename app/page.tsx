import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Phone,
  MessageSquare,
  Clock,
  Sliders,
  ClipboardList,
  ShieldCheck,
  Zap,
  Bell,
  PhoneCall,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import ChatCardSpread from "@/components/ChatCardSpread";
import StatsCarousel from "@/components/StatsCarousel";
import AudioDemo from "@/components/AudioDemo";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "var(--font-geist-sans)" }}>

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-bold text-gray-900 text-lg tracking-tight">Salva AI</span>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
              <Link href="/pricing" className="hover:text-gray-800 transition-colors">Pricing</Link>
              <a href="#features" className="hover:text-gray-800 transition-colors">Features</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 transition-colors">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Start free trial
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative bg-gray-950 overflow-hidden">
        {/* Subtle radial glow behind headline */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="w-[900px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/4" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            AI Voice + Chat Receptionist for Dental Practices
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6 max-w-3xl mx-auto">
            Your practice loses<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">$150,000 a year</span><br />
            to missed calls.
          </h1>

          <p className="text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Salva AI answers every call and chat 24/7 — trained on your practice&apos;s FAQs, services, and hours so no new patient ever hits voicemail again.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            <Link
              href="/sign-up"
              className="bg-white text-gray-900 px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors shadow-sm"
            >
              Start 14-day free trial
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-gray-300 hover:text-white px-7 py-3.5 rounded-xl border border-white/15 hover:border-white/30 transition-colors font-medium"
            >
              See pricing →
            </Link>
          </div>
          <p className="text-xs text-gray-600 mb-14">14-day free trial. Cancel anytime.</p>

          {/* Pain stats strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden max-w-2xl mx-auto">
            <div className="bg-gray-900 px-6 py-5">
              <p className="text-2xl font-bold text-white tracking-tight">35%</p>
              <p className="text-xs text-gray-500 mt-1">of dental calls go unanswered</p>
            </div>
            <div className="bg-gray-900 px-6 py-5">
              <p className="text-2xl font-bold text-white tracking-tight">78%</p>
              <p className="text-xs text-gray-500 mt-1">hang up without leaving a voicemail</p>
            </div>
            <div className="bg-gray-900 px-6 py-5">
              <p className="text-2xl font-bold text-white tracking-tight">$850</p>
              <p className="text-xs text-gray-500 mt-1">lost per missed new patient call</p>
            </div>
          </div>
        </div>
      </section>

      {/* Animated chat card spread */}
      <section className="pb-32 px-6 bg-gray-50">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10">
          Real conversations, handled automatically
        </p>
        <ChatCardSpread />
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <StatsCarousel />
        </div>
      </section>

      {/* Audio demo */}
      <AudioDemo />

      {/* How it works */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
              How Salva AI handles a call
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              From ring to resolution in seconds — without a single staff member picking up.
            </p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[14%] right-[14%] h-px bg-gray-200" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {howItWorks.map((step, i) => (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <step.icon size={24} strokeWidth={1.5} />
                  </div>
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Step {i + 1}</div>
                  <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
            Voice AI + chat, fully automated
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Answers calls, handles after-hours questions, and books more patients — without adding a single staff member.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                <f.icon size={20} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
      </section>

      {/* Setup timeline */}
      <section className="bg-gray-50 py-24 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
              Up and running in minutes
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              No IT team. No long onboarding. Most practices are live the same day they sign up.
            </p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%] h-0.5 bg-gray-200" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {setupTimeline.map((t, i) => (
                <div key={t.milestone} className="flex flex-col items-center text-center">
                  <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-sm font-bold shadow-sm ${
                    i === 0 ? "bg-blue-600 text-white" : i === 1 ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500"
                  }`}>
                    {t.milestone}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-12">
            Works alongside your existing practice management software — no integrations required until you&apos;re ready.
          </p>
        </div>
      </section>

      {/* Competitive nudge */}
      <div className="text-center pb-10">
        <p className="text-sm text-gray-400">Most practices save $60–160/month vs competitors.</p>
      </div>

      {/* CTA banner */}
      <section className="bg-gray-900 mx-6 mb-16 rounded-3xl">
        <div className="max-w-2xl mx-auto px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
            Every missed call is a missed patient.
          </h2>
          <p className="text-gray-400 mb-8">
            Salva AI answers 24/7 so you never lose another one. First 14 days free.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-white text-gray-900 px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Start free trial →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-semibold text-gray-700">Salva AI</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-600 transition-colors">Pricing</Link>
            <Link href="/sign-in" className="hover:text-gray-600 transition-colors">Sign in</Link>
          </div>
          <span>© {new Date().getFullYear()} Salva AI</span>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Phone,
    title: "AI voice answering",
    description: "Forward your practice number to Salva AI. Every call gets answered in your voice — appointments, insurance questions, after-hours, anything.",
  },
  {
    icon: Clock,
    title: "After-hours coverage",
    description: "Your AI receptionist never sleeps. Capture new patient inquiries at 11pm on a Sunday that would otherwise go unanswered.",
  },
  {
    icon: MessageSquare,
    title: "Instant chat widget",
    description: "One line of code on your website. Patients get answers to their questions immediately — insurance, hours, services, anything.",
  },
  {
    icon: Sliders,
    title: "Fully customizable",
    description: "Set your AI's name, greeting, office hours, services, and FAQs. It sounds like your practice, not a generic chatbot.",
  },
  {
    icon: ClipboardList,
    title: "Conversation history",
    description: "Every call and chat is logged in your dashboard. See what patients are asking, spot trends, and never lose a lead.",
  },
  {
    icon: ShieldCheck,
    title: "HIPAA-compliant",
    description: "We never collect or store personal health information. Patients are directed to call for anything clinical.",
  },
  {
    icon: Zap,
    title: "2-minute setup",
    description: "No developer needed. Sign up, answer a few questions about your practice, copy one line of code. Done.",
  },
  {
    icon: Bell,
    title: "Smart handoffs",
    description: "If the AI can't answer, it takes a message and notifies your team immediately. No patient left without a response.",
  },
];

const howItWorks = [
  {
    icon: PhoneCall,
    title: "Patient calls",
    description: "A patient calls your practice — during hours, after hours, on a holiday. Doesn't matter.",
  },
  {
    icon: Headphones,
    title: "Salva AI answers",
    description: "The AI picks up immediately and introduces itself in your practice's voice. No hold time.",
  },
  {
    icon: CheckCircle2,
    title: "Question answered",
    description: "Hours, insurance, services, appointment requests — resolved instantly without staff involvement.",
  },
  {
    icon: Bell,
    title: "Team notified",
    description: "Can't handle it? The AI takes a message and alerts your team. No lead slips through.",
  },
];

const setupTimeline = [
  {
    milestone: "Day 1",
    title: "Chat widget live",
    description: "Copy one line of code to your website. Your AI receptionist starts answering patient questions immediately.",
  },
  {
    milestone: "Week 1",
    title: "Voice AI activated",
    description: "Forward your practice number. Every call gets answered 24/7 — no missed patients, no voicemail.",
  },
  {
    milestone: "Month 1",
    title: "ROI visible",
    description: "See every conversation in your dashboard. Track leads captured, calls answered, and patient inquiries handled.",
  },
];
