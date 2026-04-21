import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salva AI — AI Receptionist for Dental Practices",
  description:
    "Salva AI answers every patient call and chat 24/7 — books appointments, handles after-hours, and syncs with Open Dental. Start free in minutes.",
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
  Bot,
} from "lucide-react";
import ChatCardSpread from "@/components/ChatCardSpread";
import StatsCarousel from "@/components/StatsCarousel";
import DashboardMockup from "@/components/DashboardMockup";
import SocialProof from "@/components/SocialProof";
import AudioDemo from "@/components/AudioDemo";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import CustomizabilityDemo from "@/components/CustomizabilityDemo";
import Logo from "@/components/Logo";

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
                url: "https://getsalvaai.com",
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
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo width={110} height={27} />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
              <Link href="/how-it-works" className="hover:text-gray-800 transition-colors">How it works</Link>
              <Link href="/pricing" className="hover:text-gray-800 transition-colors">Pricing</Link>
              <Link href="/faq" className="hover:text-gray-800 transition-colors">FAQ</Link>
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
              Get Started Free
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative bg-gray-950 overflow-hidden">
        {/* Subtle radial glow behind headline */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="w-[900px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/4 animate-glow-float" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            AI Voice + Chat Receptionist for Dental Practices
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1] tracking-tighter mb-6 max-w-4xl mx-auto">
            Never Miss Another <br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Patient Call.</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Salva AI is trained on <em>your</em> practice — your services, tone, and FAQs — and live in minutes. No missed calls, no lost patients.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            <Link
              href="/sign-up"
              className="bg-white text-gray-900 px-20 py-3.5 rounded-xl font-semibold shadow-sm active:scale-95 animate-soft-pulse"
            >
              Start Free
            </Link>
            <Link
              href="/how-it-works"
              className="bg-orange-500 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/50"
            >
              How it works
            </Link>
          </div>


          {/* Enhanced Customisation Chips & Trust Bar */}
          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: Bot, label: "Your AI's name & voice" },
                { icon: MessageSquare, label: "Custom FAQs & greetings" },
                { icon: Sliders, label: "Services, hours & tone" }
              ].map((chip) => (
                <div 
                  key={chip.label}
                  className="flex items-center gap-2.5 bg-white/[0.03] backdrop-blur-md border border-white/10 text-gray-300 text-[13px] font-medium px-5 py-2.5 rounded-full hover:bg-white/[0.08] transition-all hover:border-white/20 shadow-2xl"
                >
                  <chip.icon size={15} className="text-blue-400" />
                  {chip.label}
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
              <span className="hidden sm:block h-px w-8 bg-gradient-to-r from-transparent to-gray-800" />
              <div className="flex items-center gap-4">
                <span>Free to start</span>
                <span className="w-1.5 h-1.5 bg-blue-500/40 rounded-full" />
                <span>Live in minutes</span>
                <span className="w-1.5 h-1.5 bg-blue-500/40 rounded-full" />
                <span>No contracts</span>
              </div>
              <span className="hidden sm:block h-px w-8 bg-gradient-to-l from-transparent to-gray-800" />
            </div>
          </div>
        </div>
      </section>

      {/* Audio demo */}
      <AudioDemo />

      {/* AI Customizability Demo */}
      <CustomizabilityDemo />

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <StatsCarousel />
        </div>
      </section>

      {/* Animated chat card spread */}
      <section className="pb-32 px-6 bg-gray-50">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10">
          Real conversations, handled automatically
        </p>
        <ChatCardSpread />
      </section>

      {/* Playbook / Workflows */}
      <section className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
              Core Workflows
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
              Handles the calls your team doesn't have time for.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Three core workflows, highly tailored to your practice. Launch in 5 minutes — with total control over every response.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1.5 group">
              <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform">
                <Headphones size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">The 24/7 Receptionist</h3>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
                Answers every call in your practice&apos;s exact tone. Handles endless FAQ loops, office hours, and parking directions without bothering your team.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] bg-gray-50 border border-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider">Natural conversation</span>
                <span className="text-[11px] bg-gray-50 border border-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider">Custom greetings</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1.5 group ring-2 ring-blue-600/5">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Insurance Checker</h3>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
                Patients ask &quot;Do you take my insurance?&quot; and Salva answers instantly from your accepted carriers list — so only the right patients get booked.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider">Easily customized</span>
                <span className="text-[11px] bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider">Carrier matching</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1.5 group">
              <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform">
                <Zap size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">New Patient Booking</h3>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
                Walks new patients through intake questions, pitches your new patient specials, and secures the booking directly into your calendar.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] bg-gray-50 border border-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider">New patient optimized</span>
                <span className="text-[11px] bg-gray-50 border border-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider">Open Dental sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice AI + chat, fully automated checklist */}
      <section className="bg-gray-50 py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
            The hardest working receptionist <br />
            <span className="text-blue-600">you&apos;ll ever meet.</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto mb-16">
            Answers calls, handles after-hours questions, and books more patients — without adding a single staff member.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { text: "Answer calls in 1 second", icon: CheckCircle2 },
              { text: "Designed for HIPAA compliance", icon: CheckCircle2 },
              { text: "Intelligent call routing", icon: CheckCircle2 },
              { text: "After-hours triage", icon: CheckCircle2 },
              { text: "Direct Open Dental sync", icon: CheckCircle2 },
              { text: "Insurance verification", icon: CheckCircle2 },
              { text: "Instant SMS alerts", icon: CheckCircle2 },
              { text: "Live dashboard reporting", icon: CheckCircle2 }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm transition-all hover:border-blue-200 group">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <f.icon size={16} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold text-gray-700 tracking-tight">{f.text}</span>
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
              Practice Management Sync
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white mb-6">Syncs directly with your Practice Management Software.</h2>
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
                <span><strong className="text-white">Dentrix & Eaglesoft:</strong> Waitlist open — join to get early access</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle2 className="text-blue-400" size={20} />
                <span><strong className="text-white">Real-time</strong> patient record lookups</span>
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
                  {`> Found slot: 2:00 PM — Tuesday morning`}
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
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
              Your practice, in real time.
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
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
              Up and running in under 5 minutes
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
            <div className="inline-flex items-center gap-2 bg-blue-50/50 border border-blue-100/50 text-blue-700 text-xs px-5 py-2.5 rounded-2xl shadow-sm backdrop-blur-sm font-bold uppercase tracking-widest">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Works with your existing systems
            </div>
          </div>
        </div>
      </section>

      {/* Social proof — hidden at launch, enable when real reviews are collected */}
      {false && <SocialProof />}

      {/* Competitive nudge */}
      <div className="text-center pb-10">
        <p className="text-sm text-gray-400">No hiring. No training. No overtime. Just results.</p>
      </div>

      {/* CTA banner */}
      <section className="bg-gray-900 mx-6 mb-16 rounded-3xl">
        <div className="max-w-2xl mx-auto px-8 py-14 text-center">
          <h2 className="text-4xl font-black text-white tracking-tight mb-4">
            Every missed call is a missed patient.
          </h2>
          <p className="text-gray-400 mb-8">
            Salva AI answers 24/7 so you never lose another one.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-white text-gray-900 px-20 py-3.5 rounded-xl font-semibold shadow-sm active:scale-95 animate-soft-pulse"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Floating chat widget */}
      <FloatingChatWidget businessId={process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID ?? ""} />

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 text-sm text-gray-400">
          <div className="flex flex-col gap-2">
            <Logo width={110} height={28} />
            <p className="text-xs text-gray-500">AI receptionist built for dental practices.</p>
          </div>
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

const setupTimeline = [
  {
    milestone: "Step 1",
    title: "Customize & Train",
    description: "Launch your custom dashboard, define your services, and set your AI's unique tone and FAQs in minutes.",
  },
  {
    milestone: "Step 2",
    title: "Test & Review",
    description: "Interact with your AI over live call or chat to ensure it answers exactly how you want your staff to respond.",
  },
  {
    milestone: "Step 3",
    title: "Go Live",
    description: "Redirect your practice number or embed the chat widget. Start capturing every missed patient inquiry immediately.",
  },
];
