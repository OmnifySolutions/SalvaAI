import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  MessageSquare,
  Clock,
  Sliders,
  ClipboardList,
  ShieldCheck,
  Zap,
} from "lucide-react";
import ChatCardSpread from "@/components/ChatCardSpread";
import FloatingBubbles from "@/components/FloatingBubbles";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "var(--font-geist-sans)" }}>

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-bold text-gray-900 text-lg tracking-tight">HustleClaude</span>
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
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-32 text-center overflow-hidden">
        <FloatingBubbles />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            AI Receptionist for Dental Practices
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6 max-w-3xl mx-auto">
            Your front desk,<br />
            <span className="text-blue-600">available 24/7</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            An AI receptionist that answers patient questions, handles after-hours inquiries, and never puts anyone on hold — embedded directly on your website.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/sign-up"
              className="bg-gray-900 text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors shadow-sm"
            >
              Start 30-day free trial
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-gray-500 hover:text-gray-800 px-7 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors font-medium"
            >
              See pricing →
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">No credit card required. Setup in 2 minutes.</p>
        </div>
      </section>

      {/* Animated chat card spread */}
      <section className="pb-32 px-6">
        <div className="max-w-sm mx-auto">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10">
            Real conversations, handled automatically
          </p>
          <ChatCardSpread />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">$200+</div>
            <div className="text-sm text-gray-500 mt-1">value of a missed new patient</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">24/7</div>
            <div className="text-sm text-gray-500 mt-1">always-on coverage</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">2 min</div>
            <div className="text-sm text-gray-500 mt-1">to set up and go live</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
            Everything your front desk needs
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            One small script on your website. Patients get instant answers. You get more booked appointments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center mb-4 text-gray-700">
                <f.icon size={20} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-gray-900 mx-6 mb-16 rounded-3xl">
        <div className="max-w-2xl mx-auto px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
            Stop losing patients after hours
          </h2>
          <p className="text-gray-400 mb-8">
            Join practices that never miss an inquiry again. First 30 days free.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-white text-gray-900 px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Get started free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-semibold text-gray-700">HustleClaude</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-600 transition-colors">Pricing</Link>
            <Link href="/sign-in" className="hover:text-gray-600 transition-colors">Sign in</Link>
          </div>
          <span>© {new Date().getFullYear()} HustleClaude</span>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: MessageSquare,
    title: "Instant chat widget",
    description: "One line of code on your website. Patients get answers to their questions immediately — insurance, hours, services, anything.",
  },
  {
    icon: Clock,
    title: "After-hours coverage",
    description: "Your AI receptionist never sleeps. Capture new patient inquiries at 11pm on a Sunday that would otherwise go unanswered.",
  },
  {
    icon: Sliders,
    title: "Fully customizable",
    description: "Set your AI's name, greeting, office hours, services, and FAQs. It sounds like your practice, not a generic chatbot.",
  },
  {
    icon: ClipboardList,
    title: "Conversation history",
    description: "Every chat is logged in your dashboard. See what patients are asking, spot trends, and never lose a lead.",
  },
  {
    icon: ShieldCheck,
    title: "HIPAA-safe by design",
    description: "We never collect or store personal health information. Patients are directed to call for anything clinical.",
  },
  {
    icon: Zap,
    title: "2-minute setup",
    description: "No developer needed. Sign up, answer a few questions about your practice, copy one line of code. Done.",
  },
];
