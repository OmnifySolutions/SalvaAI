"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import DashboardMockup from "@/components/DashboardMockup";
import { FEATURE_DEFINITIONS, GROUP_LABELS } from "@/lib/ai-features";
import {
  CheckCircle2,
  CalendarCheck,
  Moon,
  ListOrdered,
  Siren,
  ShieldCheck,
  UserPlus,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Phone,
  Bell,
  User,
  Bot,
  Sparkles,
  ToggleLeft,
  LayoutList,
  Zap,
  Check,
  X,
  PhoneCall,
} from "lucide-react";

// ─── Static data ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  CalendarCheck,
  Moon,
  ListOrdered,
  Siren,
  ShieldCheck,
  UserPlus,
  DollarSign,
  CreditCard,
};

const GROUP_DOT_COLOR: Record<string, string> = {
  booking: "bg-blue-500",
  clinical: "bg-orange-500",
  financial: "bg-green-500",
};

const FEATURE_QA: Record<string, { question: string; on: string; off: string }> = {
  instant_booking: {
    question: "I'd like to schedule a cleaning next week.",
    on: "Of course! I can book that right now. What day works best — Tuesday or Wednesday? And morning or afternoon?",
    off: "Great! I'll let our team know. Someone will call you back within 1 business day to confirm your time.",
  },
  after_hours_handling: {
    question: "Hi, are you still open? I have a question about my appointment.",
    on: "We're currently closed for the evening, but I'm here 24/7. I can take your question now and someone will follow up first thing tomorrow morning.",
    off: "Hi! Thanks for reaching out to Bright Smiles Dental. How can I help you today?",
  },
  waitlist_offers: {
    question: "Do you have anything open this Thursday?",
    on: "Thursday is fully booked right now. I can add you to our cancellation waitlist — if a slot opens up, you'll be the first to know. Want me to do that?",
    off: "Thursday is fully booked right now. Please try calling us back in a few days and we'll check availability again.",
  },
  emergency_detection: {
    question: "I have really bad tooth pain and my face is swelling.",
    on: "That sounds urgent — facial swelling with tooth pain needs to be seen today. I'm flagging this as an emergency. Can you come in within 2 hours, or would you like our emergency contact number?",
    off: "I'm sorry to hear you're in pain. Our next available appointment is Thursday at 2pm. Would you like me to book that?",
  },
  insurance_questions: {
    question: "Do you accept Blue Cross Blue Shield?",
    on: "Yes! We're in-network for most BCBS PPO plans. Co-pays vary by plan — would you like to schedule and have our billing team confirm your specific benefits?",
    off: "For insurance questions, it's best to call our front desk directly. They can confirm your coverage details.",
  },
  new_patient_flow: {
    question: "I've never been to your office before.",
    on: "Welcome! Your first visit includes a comprehensive exam, X-rays, and a cleaning — about 90 minutes total. Want me to help you schedule and collect a few details so we're ready for you?",
    off: "Great! You can book an appointment and our team will walk you through everything when you arrive.",
  },
  pricing_transparency: {
    question: "How much does a crown typically cost?",
    on: "Crowns typically range from $800–$1,800 depending on material and location. Insurance often covers 50% after deductible. The dentist will give you an exact quote at your consultation — want to schedule one?",
    off: "For pricing, please call our front desk and they can walk you through costs and what your insurance may cover.",
  },
  payment_plans: {
    question: "I need a root canal but I'm worried about the cost.",
    on: "Totally understandable. We offer flexible payment plans — many patients split it into easy monthly payments. Want me to book a consultation so we can talk through your options?",
    off: "Root canals can be a significant investment. Give us a call and we can discuss what your insurance may cover.",
  },
};

const SETTINGS_TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "services", label: "Services", icon: LayoutList },
  { id: "ai", label: "AI Config", icon: Bot },
  { id: "features", label: "Features", icon: Sparkles },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "voice", label: "Voice Settings", icon: PhoneCall },
  { id: "dos", label: "Do's & Don'ts", icon: ToggleLeft },
  { id: "integrations", label: "Integrations", icon: Zap },
];

const TONES = [
  { id: "professional", label: "Professional & Efficient", desc: "Direct, minimal small talk" },
  { id: "warm", label: "Warm & Friendly", desc: "Conversational, encouraging" },
  { id: "clinical", label: "Clinical & Precise", desc: "Formal, medically oriented" },
];

const TRANSCRIPTS: Record<string, { speaker: "AI" | "Patient"; text: string }[]> = {
  professional: [
    { speaker: "AI", text: "Bright Smiles Dental, this is Claire. How can I help you?" },
    { speaker: "Patient", text: "I need to make an appointment for a cleaning." },
    { speaker: "AI", text: "Of course. Full name and preferred day?" },
    { speaker: "Patient", text: "Emily Davis. Preferably Thursday." },
    { speaker: "AI", text: "Thursday at 10am works. Shall I confirm that?" },
  ],
  warm: [
    { speaker: "AI", text: "Hi there! You've reached Bright Smiles Dental — I'm Claire, how can I help you today?" },
    { speaker: "Patient", text: "Hey! I need to come in for a cleaning." },
    { speaker: "AI", text: "Oh wonderful — we'd love to see you! Do you have a preferred day? We're pretty flexible!" },
    { speaker: "Patient", text: "Thursday would be great." },
    { speaker: "AI", text: "Perfect! Thursday at 10am is open. Let's get you locked in!" },
  ],
  clinical: [
    { speaker: "AI", text: "Bright Smiles Dental. Reason for contact?" },
    { speaker: "Patient", text: "Appointment for a cleaning." },
    { speaker: "AI", text: "Name and date of birth?" },
    { speaker: "Patient", text: "Emily Davis, March 12, 1990." },
    { speaker: "AI", text: "Thursday 1000 hours confirmed. Any additional concerns?" },
  ],
};

type InboxTab = "emergencies" | "bookings" | "callbacks";

const INBOX_DATA: Record<InboxTab, { name: string; summary: string; time: string; badge?: string }[]> = {
  emergencies: [
    {
      name: "Sarah M.",
      summary: "Reporting severe jaw swelling with difficulty opening mouth. Flagged as dental emergency.",
      time: "2m ago",
      badge: "Emergency",
    },
    {
      name: "James T.",
      summary: "Knocked-out tooth. Requesting same-day emergency appointment.",
      time: "14m ago",
      badge: "Emergency",
    },
  ],
  bookings: [
    {
      name: "Maria Lopez",
      summary: "Requesting new patient exam + cleaning. Preferred: Thursday afternoon.",
      time: "5m ago",
    },
    {
      name: "Dan Kirby",
      summary: "Wants crown consultation. Has Delta Dental PPO insurance.",
      time: "31m ago",
    },
  ],
  callbacks: [
    {
      name: "Emily R.",
      summary: "Asking about teeth whitening cost. Wants a callback before 5pm today.",
      time: "1h ago",
    },
  ],
};

const INBOX_TAB_LIST: { id: InboxTab; label: string; icon: LucideIcon }[] = [
  { id: "emergencies", label: "Emergencies", icon: AlertTriangle },
  { id: "bookings", label: "Pending Bookings", icon: CalendarCheck },
  { id: "callbacks", label: "Callbacks", icon: Phone },
];

const DOS_ITEMS = [
  "Always ask for the patient's preferred appointment time",
  "Mention that new patient exams take approximately 90 minutes",
  "Offer the cancellation waitlist when fully booked",
  "Confirm the patient's name and contact number before ending the call",
];

const DONTS_ITEMS = [
  "Never quote exact prices — always say 'call for pricing'",
  "Never promise a specific appointment slot without confirming availability",
  "Never diagnose symptoms or provide clinical advice",
  "Never share other patients' information",
];

const COMING_SOON = ["EagleSoft", "Dentrix", "Curve Dental", "Carestream", "Dolphin Mgmt", "Fuse"];

// ─── Shared components ────────────────────────────────────────────────────────

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className={`w-10 h-5 rounded-full flex items-center transition-colors duration-200 shrink-0 ${
        on ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-gray-900 text-lg tracking-tight">
            Salva AI
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <Link href="/how-it-works" className="text-gray-900 font-medium">
              How it works
            </Link>
            <Link href="/pricing" className="hover:text-gray-800 transition-colors">
              Pricing
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 transition-colors"
          >
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
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative bg-gray-950 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
        <div className="w-[900px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/4" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
          Full Product Tour
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
          See everything{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Salva AI
          </span>{" "}
          can do
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          For dentists who want to know exactly what they&rsquo;re getting — and office managers who want to understand every control. Every feature, every setting, all in one place.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/sign-up"
            className="bg-white text-gray-900 px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Start free trial
          </Link>
          <Link
            href="/pricing"
            className="border border-white/15 text-gray-300 px-7 py-3.5 rounded-xl font-semibold hover:border-white/30 transition-colors"
          >
            See pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Section ────────────────────────────────────────────────────────

function DashboardSection() {
  const bullets = [
    { label: "Total interactions", desc: "Every chat and call, tracked automatically" },
    { label: "Appointments booked", desc: "See how many patients converted to bookings" },
    { label: "Phone calls handled", desc: "Total voice calls answered by your AI" },
    { label: "After-hours coverage", desc: "Contacts handled outside office hours" },
  ];

  return (
    <section className="bg-white py-24 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              Analytics
            </div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Real-time intelligence.<br />No guesswork.
            </h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Your dashboard shows exactly how your AI is performing — at a glance, the moment you log in.
            </p>
            <ul className="space-y-4">
              {bullets.map((b) => (
                <li key={b.label} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900">{b.label}</span>
                    <span className="text-gray-500"> — {b.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-xl">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── AI Features Section ──────────────────────────────────────────────────────

function AIFeaturesSection() {
  const [focused, setFocused] = useState("instant_booking");
  const [enabled, setEnabled] = useState(new Set<string>());

  function handleToggle(key: string) {
    setFocused(key);
    setEnabled((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const focusedFeature = FEATURE_DEFINITIONS.find((f) => f.key === focused);
  const qa = FEATURE_QA[focused];
  const isOn = enabled.has(focused);

  return (
    <section className="bg-gray-50 py-24 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            AI Behaviors
          </div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            8 AI behaviors. All toggleable.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Click any feature to see exactly how it changes your AI&rsquo;s responses — in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Feature list */}
          <div className="space-y-6">
            {(["booking", "clinical", "financial"] as const).map((group) => (
              <div key={group}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${GROUP_DOT_COLOR[group]}`} />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {GROUP_LABELS[group]}
                  </span>
                </div>
                <div className="space-y-2">
                  {FEATURE_DEFINITIONS.filter((f) => f.group === group).map((feature) => {
                    const Icon = ICON_MAP[feature.icon];
                    const isFocused = focused === feature.key;
                    const isEnabled = enabled.has(feature.key);
                    return (
                      <button
                        key={feature.key}
                        type="button"
                        onClick={() => handleToggle(feature.key)}
                        className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                          isFocused
                            ? "border-blue-300 bg-white shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isEnabled ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {Icon && <Icon size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900">{feature.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5 leading-snug">
                            {feature.description}
                          </div>
                        </div>
                        <Toggle on={isEnabled} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Live chat preview */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  AI
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-semibold">Claire — AI Receptionist</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                    <span className="text-gray-400 text-xs">Online</span>
                  </div>
                </div>
                {focusedFeature && (
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      isOn ? "bg-blue-600/20 text-blue-300" : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {isOn ? "ON" : "OFF"}
                  </span>
                )}
              </div>

              {qa && (
                <div className="p-5 space-y-3" key={focused + String(isOn)}>
                  <p className="text-xs text-gray-400">
                    Feature:{" "}
                    <span className="font-semibold text-gray-600">{focusedFeature?.label}</span>
                  </p>
                  <div className="flex justify-end">
                    <div className="bg-gray-900 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[82%] text-sm shadow-sm">
                      {qa.question}
                    </div>
                  </div>
                  <div className="flex justify-start animate-fade-slide">
                    <div className="bg-white border border-gray-200 text-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] text-sm shadow-sm">
                      {isOn ? qa.on : qa.off}
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-400 pt-1">
                    Toggle the feature above to see the response change
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Settings Mockup Section ──────────────────────────────────────────────────

function SettingsMockupSection() {
  const [activeTab, setActiveTab] = useState("ai");
  const [tone, setTone] = useState("professional");

  return (
    <section className="bg-white py-24 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Settings
          </div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Configure everything.<br />No developer needed.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Every detail of your AI — from its name and personality to its voice tone — is configurable from your dashboard.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Browser chrome */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 text-center">
              app.salvaai.com/settings
            </div>
          </div>

          <div className="flex bg-white min-h-[500px]">
            {/* Sidebar */}
            <div className="w-52 border-r border-gray-100 p-4 bg-gray-50/60 shrink-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">
                Settings
              </p>
              <ul className="space-y-0.5">
                {SETTINGS_TABS.map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        activeTab === id
                          ? "bg-white text-blue-600 font-semibold shadow-sm ring-1 ring-gray-200"
                          : "text-gray-500 hover:text-gray-700 hover:bg-white/70"
                      }`}
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content panel */}
            <div className="flex-1 p-8 overflow-auto">
              <div key={activeTab} className="animate-fade-slide">
                {activeTab === "ai" && (
                  <div className="space-y-5 max-w-lg">
                    <h3 className="text-lg font-bold text-gray-900">AI Configuration</h3>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">
                        Agent Name
                      </label>
                      <input
                        readOnly
                        value="Claire"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 cursor-default"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Patients hear this name when the AI answers calls.
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">
                        Custom Greeting
                      </label>
                      <input
                        readOnly
                        value="Hi! Thanks for calling Bright Smiles Dental. How can I help you today?"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 cursor-default"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">
                        System Prompt
                      </label>
                      <textarea
                        readOnly
                        rows={4}
                        value="You are a professional dental receptionist AI named Claire. You handle appointment scheduling, patient questions, and after-hours inquiries for Bright Smiles Dental. Always be warm, helpful, and guide patients toward scheduling."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 cursor-default resize-none"
                      />
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-600">
                      ✦ Live preview — configure these in your dashboard after signing up.
                    </div>
                  </div>
                )}

                {activeTab === "voice" && (
                  <div className="space-y-5 max-w-lg">
                    <h3 className="text-lg font-bold text-gray-900">Voice Settings</h3>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-3">
                        Acoustic Tone
                      </label>
                      <div className="space-y-2">
                        {TONES.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTone(t.id)}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                              tone === t.id
                                ? "border-blue-600 bg-blue-50/50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="font-semibold text-sm text-gray-900">{t.label}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Virtual Number
                      </label>
                      <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                        <PhoneCall size={14} />
                        +1 (602) 555-0182
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200">
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Accept Calls</div>
                        <div className="text-xs text-gray-500">AI answers all incoming calls</div>
                      </div>
                      <Toggle on={true} />
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-5 max-w-lg">
                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                    {[
                      {
                        label: "Emergency Alerts",
                        desc: "Get notified immediately for dental emergencies",
                        icon: Siren,
                        color: "text-red-600",
                      },
                      {
                        label: "New Booking Requests",
                        desc: "Alert when a patient requests an appointment",
                        icon: CalendarCheck,
                        color: "text-blue-600",
                      },
                      {
                        label: "Callback Requests",
                        desc: "Alert when a patient asks to be called back",
                        icon: Phone,
                        color: "text-blue-600",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between p-4 rounded-2xl border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                            <row.icon size={16} className={row.color} />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-gray-900">{row.label}</div>
                            <div className="text-xs text-gray-500">{row.desc}</div>
                          </div>
                        </div>
                        <Toggle on={true} />
                      </div>
                    ))}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500">
                      Alerts delivered via SMS, email, and WhatsApp — configure your contact details in your dashboard.
                    </div>
                  </div>
                )}

                {!["ai", "voice", "notifications"].includes(activeTab) && (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
                    {(() => {
                      const tab = SETTINGS_TABS.find((t) => t.id === activeTab);
                      if (!tab) return null;
                      const Icon = tab.icon;
                      return (
                        <>
                          <Icon size={28} className="text-gray-300" />
                          <p className="text-sm text-center max-w-xs">
                            {tab.label} settings are available in your dashboard after signing up.
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Inbox Section ─────────────────────────────────────────────────────────────

function InboxDemoSection() {
  const [activeTab, setActiveTab] = useState<InboxTab>("emergencies");
  const [userClicked, setUserClicked] = useState(false);

  useEffect(() => {
    if (userClicked) return;
    const tabs: InboxTab[] = ["emergencies", "bookings", "callbacks"];
    const id = setInterval(() => {
      setActiveTab((prev) => tabs[(tabs.indexOf(prev) + 1) % 3]);
    }, 3500);
    return () => clearInterval(id);
  }, [userClicked]);

  const items = INBOX_DATA[activeTab];

  return (
    <section className="bg-gray-50 py-24 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Inbox
          </div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Never miss an emergency<br />or booking request.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Your inbox surfaces the conversations that need human attention — emergencies, pending bookings, and callback requests — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inbox mockup */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Action Required</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {items.length} item{items.length !== 1 ? "s" : ""} need attention
                </p>
              </div>
              <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                {items.length}
              </div>
            </div>
            <div className="flex border-b border-gray-100 px-4 pt-3 gap-1">
              {INBOX_TAB_LIST.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setActiveTab(id);
                    setUserClicked(true);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                    activeTab === id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      activeTab === id
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {INBOX_DATA[id].length}
                  </span>
                </button>
              ))}
            </div>
            <div className="p-4" key={activeTab}>
              <div className="animate-fade-slide space-y-3">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === "emergencies"
                          ? "bg-red-50 text-red-500"
                          : "bg-blue-50 text-blue-500"
                      }`}
                    >
                      {activeTab === "emergencies" ? (
                        <AlertTriangle size={14} />
                      ) : activeTab === "bookings" ? (
                        <CalendarCheck size={14} />
                      ) : (
                        <Phone size={14} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm text-gray-900">{item.name}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">{item.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-snug line-clamp-2">
                        {item.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notification channels */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Alerts delivered instantly</h3>
            <p className="text-gray-500 text-sm">
              Configure which channels receive alerts for each event type.
            </p>
            {[
              {
                label: "SMS",
                desc: "Instant text alerts to your phone or team",
                on: true,
                color: "bg-green-50 text-green-600",
              },
              {
                label: "Email",
                desc: "Detailed email with full conversation context",
                on: true,
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "WhatsApp",
                desc: "WhatsApp notifications to your business number",
                on: false,
                color: "bg-gray-100 text-gray-400",
              },
            ].map((ch) => (
              <div
                key={ch.label}
                className={`flex items-center justify-between p-5 rounded-2xl border ${
                  ch.on ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${ch.color}`}
                  >
                    {ch.label[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{ch.label}</div>
                    <div className="text-xs text-gray-500">{ch.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!ch.on && (
                    <span className="text-xs text-gray-400 font-medium">Setup required</span>
                  )}
                  <Toggle on={ch.on} />
                </div>
              </div>
            ))}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-gray-900">Realtime sync</span>
              </div>
              <p className="text-xs text-gray-500">
                Your inbox updates in real time as new conversations come in — no refresh needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Do's & Don'ts Section ────────────────────────────────────────────────────

function DosDontsSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="bg-white py-24 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Custom Rules
          </div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            AI that follows<br />YOUR rules.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Write plain English rules — one per line. Your AI follows them on every call and chat, no matter what.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border-2 border-green-200 bg-green-50/30 rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                <Check size={14} className="text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900">Always do</h3>
            </div>
            <ul className="space-y-4">
              {DOS_ITEMS.map((item, i) => (
                <li
                  key={item}
                  className={`flex items-start gap-3 text-sm text-gray-700 ${
                    visible ? "animate-typewriter" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${i * 0.35}s` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-2 border-red-200 bg-red-50/30 rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                <X size={14} className="text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900">Never do</h3>
            </div>
            <ul className="space-y-4">
              {DONTS_ITEMS.map((item, i) => (
                <li
                  key={item}
                  className={`flex items-start gap-3 text-sm text-gray-700 ${
                    visible ? "animate-typewriter" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${(i + DOS_ITEMS.length) * 0.35}s` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Voice Section ────────────────────────────────────────────────────────────

function VoiceSection() {
  const [tone, setTone] = useState<"professional" | "warm" | "clinical">("professional");
  const transcript = TRANSCRIPTS[tone];

  return (
    <section className="bg-gray-50 py-24 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Voice AI
          </div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Answers every call.<br />Even at 2 a.m.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Choose how your AI sounds. Select a tone below to hear the difference in the sample transcript.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-3">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id as typeof tone)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                  tone === t.id
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-900">{t.label}</div>
                <div className="text-sm text-gray-500 mt-0.5">{t.desc}</div>
              </button>
            ))}

            <div className="pt-4 space-y-3 border-t border-gray-200 mt-6">
              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-2xl border border-gray-200">
                <div>
                  <div className="font-semibold text-sm text-gray-900">Accept Calls</div>
                  <div className="text-xs text-gray-500">AI answers all incoming calls</div>
                </div>
                <Toggle on={true} />
              </div>
              <div className="flex items-center gap-3 py-3 px-4 bg-white rounded-2xl border border-gray-200">
                <PhoneCall size={15} className="text-blue-600 shrink-0" />
                <div>
                  <div className="font-semibold text-sm text-gray-900">Virtual number included</div>
                  <div className="text-xs font-mono text-gray-500">+1 (602) 555-0182</div>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 px-4 bg-white rounded-2xl border border-gray-200">
                <Zap size={15} className="text-blue-600 shrink-0" />
                <div>
                  <div className="font-semibold text-sm text-gray-900">Smart handoffs</div>
                  <div className="text-xs text-gray-500">
                    Complex cases transfer to your team automatically
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <PhoneCall size={14} className="text-white" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">Call Transcript</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gray-400 text-xs">
                    Tone: {TONES.find((t) => t.id === tone)?.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-5" key={tone}>
              <div className="animate-fade-slide space-y-3">
                {transcript.map((line, i) => (
                  <div
                    key={i}
                    className={`flex ${line.speaker === "Patient" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                        line.speaker === "Patient"
                          ? "bg-gray-900 text-white rounded-br-sm"
                          : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm"
                      }`}
                    >
                      <span className="text-[10px] font-bold opacity-50 block mb-0.5">
                        {line.speaker}
                      </span>
                      {line.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Integrations Section ─────────────────────────────────────────────────────

function IntegrationsSection() {
  return (
    <section className="bg-white py-24 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Integrations
          </div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Works with your<br />existing software.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Plugs directly into your practice management system — no double entry, no manual syncing.
          </p>
        </div>

        <div className="border-2 border-green-500 bg-green-50/20 rounded-3xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <Zap size={24} className="text-green-700" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Open Dental</h3>
                <p className="text-sm text-gray-500">Practice Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                Connected
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: CalendarCheck, text: "Live appointment scheduling sync" },
              { icon: User, text: "Real-time patient record lookup" },
              { icon: Bell, text: "Automatic booking confirmations" },
              { icon: CheckCircle2, text: "Two-way data validation" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon size={16} className="text-green-600 shrink-0" />
                <span className="text-sm text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">
            Coming soon
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {COMING_SOON.map((name) => (
              <div
                key={name}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center opacity-60"
              >
                <div className="text-sm font-semibold text-gray-600 mb-2">{name}</div>
                <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="bg-gray-900 py-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
          Ready to transform how your practice handles patient communication?
        </h2>
        <p className="text-gray-400 text-lg mb-10">
          Set up in under 5 minutes. See the difference on day one.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/sign-up"
            className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-lg"
          >
            Start free trial
          </Link>
          <a
            href="mailto:hello@salvaai.com"
            className="border border-white/20 text-gray-300 px-8 py-4 rounded-xl font-semibold hover:border-white/40 transition-colors text-lg"
          >
            Talk to us
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-bold text-gray-900 tracking-tight">Salva AI</span>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <Link href="/how-it-works" className="hover:text-gray-800 transition-colors">
            How it works
          </Link>
          <Link href="/pricing" className="hover:text-gray-800 transition-colors">
            Pricing
          </Link>
          <Link href="/sign-in" className="hover:text-gray-800 transition-colors">
            Sign in
          </Link>
        </div>
        <p className="text-sm text-gray-400">© {new Date().getFullYear()} Salva AI</p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div
      className="min-h-screen bg-white text-gray-900"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      <Nav />
      <HeroSection />
      <DashboardSection />
      <AIFeaturesSection />
      <SettingsMockupSection />
      <InboxDemoSection />
      <DosDontsSection />
      <VoiceSection />
      <IntegrationsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
