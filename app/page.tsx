import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salva AI — AI Receptionist for Dental Offices",
  description:
    "24/7 AI receptionist and chat widget for dental practices. Answer every new-patient call, book appointments, and sync with OpenDental.",
  alternates: { canonical: "/" },
};
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
import DashboardMockup from "@/components/DashboardMockup";
import SocialProof from "@/components/SocialProof";
import AudioDemo from "@/components/AudioDemo";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "var(--font-geist-sans)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: "Salva AI",
                url: "https://salvaai.com",
                description: "AI receptionist and chat widget for dental offices.",
              },
              {
                "@type": "SoftwareApplication",
                name: "Salva AI",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                description:
                  "24/7 AI receptionist and chat widget for dental practices. Answers calls, books appointments, and syncs with practice management software.",
                offers: {
                  "@type": "AggregateOffer",
                  lowPrice: "0",
                  highPrice: "749",
                  priceCurrency: "USD",
                },
              },
            ],
          }),
        }}
      />

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
            Every missed call<br />
            is a <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">missed patient.</span><br />
            Salva AI answers them all.
          </h1>

          <p className="text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Salva AI answers every call and chat 24/7, trained on your FAQs, services, and hours — so no new-patient inquiry ever hits voicemail again.
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
              Compare plans
            </Link>
          </div>
          <p className="text-xs text-gray-600 mb-14">14-day free trial. Cancel anytime.</p>

          {/* Pain stats strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden max-w-2xl mx-auto">
            <div className="bg-gray-900 px-6 py-5">
              <p className="text-2xl font-bold text-white tracking-tight">1 in 3</p>
              <p className="text-xs text-gray-500 mt-1">new-patient calls go unanswered</p>
            </div>
            <div className="bg-gray-900 px-6 py-5">
              <p className="text-2xl font-bold text-white tracking-tight">4 in 5</p>
              <p className="text-xs text-gray-500 mt-1">callers hang up instead of leaving voicemail</p>
            </div>
            <div className="bg-gray-900 px-6 py-5">
              <p className="text-2xl font-bold text-white tracking-tight">$850</p>
              <p className="text-xs text-gray-500 mt-1">estimated value per missed new-patient call</p>
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

      {/* Playbook / Workflows */}
      <section className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
              The AI Playbook
            </div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Works exactly like your top staff
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Three core workflows, pre-trained and ready. Activate instantly — no setup required.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Headphones size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">The 24/7 Receptionist</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Answers every call in your practice's exact tone. Handles endless FAQ loops, office hours, and parking directions without bothering your team.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md font-medium">Barge-in supported</span>
                <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md font-medium">Custom greetings</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Insurance Checker</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Patients ask "Do you take my insurance?" and Salva checks your accepted list immediately. Stops bad leads and books the good ones.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md font-medium">Pre-trained</span>
                <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md font-medium">Medicaid routing</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Zap size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">New Patient Booking</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Walks new patients through intake questions, pitches your new patient specials, and secures the booking directly into your calendar.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md font-medium">High conversion</span>
                <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md font-medium">Guided onboarding</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-24 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
            Voice AI + chat, fully automated
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Answers calls, handles after-hours questions, and books more patients — without adding a single staff member.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
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

      {/* PMS Integration */}
      <section className="bg-gray-900 py-24 text-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full tracking-wide uppercase">
              Deep Integrations
            </div>
            <h2 className="text-4xl font-bold tracking-tight">Syncs directly with your Practice Management Software.</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Real-time, bi-directional sync means your AI agent always knows your true availability, and appointments book directly into your actual calendar.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 className="text-blue-400" size={20} />
                <span><strong className="text-white">Open Dental:</strong> Fully integrated and supported</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 className="text-blue-400" size={20} />
                <span><strong className="text-white">Dentrix & Eaglesoft:</strong> Waitlist integrations active</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 className="text-blue-400" size={20} />
                <span><strong className="text-white">Real Time</strong> patient record lookups</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full relative">
            <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 p-6 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-4 mb-6 border-b border-gray-700 pb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Zap className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Live Booking Engine</h3>
                  <p className="text-xs text-gray-400">Connected to OpenDental API</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-900/50 p-4 rounded-xl text-sm font-mono text-green-400">
                  {`> Checking availability for next Tuesday...`}
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl text-sm font-mono text-green-400 opacity-80">
                  {`> Found slot: 2:00 PM with Dr. Smith`}
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl text-sm font-mono flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-white font-bold animate-pulse">Awaiting patient confirmation...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard mockup */}
      <section className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
              Everything in one place
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Your dashboard shows every call and chat in real time — so you always know what patients are asking.
            </p>
          </div>
          <DashboardMockup />
        </div>
      </section>

      {/* Setup timeline */}
      <section className="bg-gray-50 py-32 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Up and running in minutes
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-lg">
              No IT team. No months of onboarding. The moment you sign up, you're ready to go.
            </p>
          </div>
          <div className="relative">
            {/* Background connecting line */}
            <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-100 via-blue-600 to-gray-200" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-14 relative z-10">
              {setupTimeline.map((t, i) => (
                <div key={t.milestone} className="flex flex-col items-center text-center">
                  <div className={`w-auto px-6 h-14 rounded-full flex items-center justify-center mb-6 text-sm font-bold shadow-lg ring-4 ring-white ${
                    i === 0 ? "bg-blue-600 text-white" : i === 1 ? "bg-gray-900 text-white" : "bg-white border-2 border-gray-200 text-gray-700"
                  }`}>
                    {t.milestone}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed px-4">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-16 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-xl shadow-sm">
              <CheckCircle2 size={16} className="text-blue-500" />
              Works alongside your existing systems.
            </div>
          </div>
        </div>
      </section>

      {/* Social proof — hidden at launch, enable when real reviews are collected */}
      {false && <SocialProof />}

      {/* Competitive nudge */}
      <div className="text-center pb-10">
        <p className="text-sm text-gray-400">Often costs less than hiring a part-time receptionist.</p>
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
    milestone: "Week 1",
    title: "Chat widget live",
    description: "Copy one line of code to your website. Your AI receptionist starts answering patient questions immediately.",
  },
  {
    milestone: "Week 1–2",
    title: "Voice AI activated",
    description: "Forward your practice number after setup. Every call gets answered 24/7 — no missed patients, no voicemail.",
  },
  {
    milestone: "Week 2–4",
    title: "ROI tracking live",
    description: "See every conversation in your dashboard. Track leads captured, calls answered, and patient inquiries handled.",
  },
];
