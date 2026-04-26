"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HoursPicker, { type WeeklyHours, DEFAULT_HOURS } from "@/components/HoursPicker";
import OnboardingIntro from "@/components/onboarding/OnboardingIntro";
import { getServiceDefaults, buildDefaultGreeting, type ServiceDefault } from "@/lib/service-defaults";
import { Clock, X, Phone, Calendar, Sparkles, Bell, Building2, Siren, Mic, Loader2 } from "lucide-react";

type Phase = "intro" | "wizard";
type Service = ServiceDefault;

const STEPS = [
  { id: 1, label: "Practice" },
  { id: 2, label: "Services" },
  { id: 3, label: "AI Setup" },
  { id: 4, label: "Alerts" },
  { id: 5, label: "Integration" },
];

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" />}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const plan = planParam ?? "";
  const billing = (searchParams.get("billing") ?? "annual") as "annual" | "monthly";
  const isVoicePlan = plan === "pro" || plan === "multi";

  // No plan selected — send to pricing first
  useEffect(() => {
    if (!planParam || planParam === "free") {
      router.replace("/pricing");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("dental");
  const [hours, setHours] = useState<WeeklyHours>(DEFAULT_HOURS);

  // Step 2
  const [services, setServices] = useState<Service[]>([
    { name: "", durationMinutes: 60, description: "" },
  ]);

  // Step 3
  const [aiName, setAiName] = useState("");
  const [aiGreeting, setAiGreeting] = useState("");
  const [demoStatus, setDemoStatus] = useState<"idle" | "loading" | "ringing" | "speaking" | "error">("idle");

  // Step 4
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");

  // Step 5
  const [odServerUrl, setOdServerUrl] = useState("");
  const [odApiKey, setOdApiKey] = useState("");

  const defaultsForType = getServiceDefaults(businessType);

  function addService() {
    setServices((s) => [...s, { name: "", durationMinutes: 60, description: "" }]);
  }
  function updateService<K extends keyof Service>(i: number, field: K, value: Service[K]) {
    setServices((arr) => arr.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }
  function removeService(i: number) {
    setServices((arr) => arr.filter((_, idx) => idx !== i));
  }

  async function playDemo() {
    if (demoStatus === "loading" || demoStatus === "ringing" || demoStatus === "speaking") return;
    const name = aiName.trim() || "Claire";
    const greeting = aiGreeting.trim() || buildDefaultGreeting(name, businessName);
    setDemoStatus("loading");
    try {
      const res = await fetch("/api/tts/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: greeting }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDemoStatus("ringing");
      await new Promise((r) => setTimeout(r, 1400));
      const audio = new Audio(url);
      audio.onended = () => { setDemoStatus("idle"); URL.revokeObjectURL(url); };
      setDemoStatus("speaking");
      await audio.play();
    } catch {
      setDemoStatus("error");
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(aiGreeting || buildDefaultGreeting(aiName || "Claire", businessName));
        u.onend = () => setDemoStatus("idle");
        setDemoStatus("speaking");
        window.speechSynthesis.speak(u);
      }
    }
  }

  function next() {
    if (step === 1 && !businessName.trim()) {
      setError("Please enter your practice name");
      return;
    }
    setError("");
    setStep((s) => Math.min(5, s + 1));
  }
  function back() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    setLoading(true); setError("");
    try {
      const finalServices = services.filter((s) => s.name.trim());
      const finalGreeting = aiGreeting.trim() || buildDefaultGreeting(aiName, businessName);
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          businessType,
          hours,
          services: finalServices,
          aiName: aiName.trim() || "Claire",
          aiGreeting: finalGreeting,
          notifyEmergencyPhone: notifyPhone.trim() || null,
          notifyEmergencyEmail: notifyEmail.trim() || null,
          opendentalServerUrl: odServerUrl.trim() || null,
          opendentalApiKey: odApiKey.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      if (plan && plan !== "free") {
        router.push(`/checkout?plan=${plan}&billing=${billing}`);
        return;
      }

      router.push("/dashboard?onboarded=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (phase === "intro") {
    return <OnboardingIntro onContinue={() => setPhase("wizard")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110"
                        : step > s.id
                          ? "bg-gray-900 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.id ? "✓" : s.id}
                  </div>
                  <span className={`text-[10px] mt-1.5 uppercase tracking-wider font-semibold ${step === s.id ? "text-gray-900" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 mb-4 rounded-full transition-colors ${step > s.id ? "bg-gray-900" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Step 1 */}
        {step === 1 && (
          <Card>
            <StepHeader
              icon={<Building2 size={22} />}
              title="Tell us about your practice"
              subtitle="The basics your AI needs to represent you accurately."
              benefit="Your AI will use this to answer 'when are you open?' and set patient expectations."
            />
            <div className="space-y-6 max-w-xl">
              <Labeled label="Practice name" required>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Sunshine Family Dentistry"
                  className={inputCls}
                  autoFocus
                />
              </Labeled>
              <Labeled label="Specialty">
                <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className={inputCls}>
                  <option value="dental">General Dental</option>
                  <option value="orthodontics">Orthodontics</option>
                  <option value="oral_surgery">Oral Surgery</option>
                  <option value="pediatric_dental">Pediatric Dentistry</option>
                  <option value="other">Other</option>
                </select>
              </Labeled>
              <Labeled label="Business hours">
                <div className="border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50">
                  <HoursPicker value={hours} onChange={setHours} />
                </div>
              </Labeled>
            </div>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card>
            <StepHeader
              icon={<Calendar size={22} />}
              title="Which services do you offer?"
              subtitle="Add each treatment with how long it typically takes."
              benefit="Your AI uses this to quote appointment lengths and book the right slot."
            />

            {services.length === 1 && !services[0].name.trim() && (
              <div className="mb-5 p-4 rounded-2xl bg-blue-50 border border-blue-100 max-w-2xl">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Suggestions for {businessType.replace(/_/g, " ")}</p>
                <p className="text-xs text-gray-600 mb-3">Tap to use, or fill out your own below.</p>
                <div className="flex flex-wrap gap-2">
                  {defaultsForType.map((d) => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => setServices([d, ...services.filter((s) => s.name.trim() || services.length === 1 ? s.name.trim() : false)])}
                      className="text-xs bg-white border border-blue-200 text-gray-700 px-3 py-1.5 rounded-full hover:border-blue-400 hover:shadow-sm transition-all"
                    >
                      + {d.name} <span className="text-gray-400">· {d.durationMinutes}min</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setServices(defaultsForType)}
                    className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Use all →
                  </button>
                </div>
              </div>
            )}

            <div className="max-w-2xl space-y-3">
              {services.map((svc, i) => (
                <div key={i} className="group bg-gray-50 p-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Service name</p>
                      <input
                        type="text"
                        placeholder={defaultsForType[i % defaultsForType.length]?.name ?? "e.g. Adult Cleaning"}
                        value={svc.name}
                        onChange={(e) => updateService(i, "name", e.target.value)}
                        className="w-full text-sm font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none pb-1 placeholder-gray-300 transition-colors"
                      />
                    </div>
                    <div className="shrink-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Clock size={10} />Duration</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={5}
                          step={5}
                          value={svc.durationMinutes}
                          onChange={(e) => updateService(i, "durationMinutes", Math.max(5, parseInt(e.target.value) || 5))}
                          className="w-16 text-sm font-semibold text-center bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        <span className="text-xs text-gray-400 font-medium">min</span>
                      </div>
                    </div>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(i)}
                        className="text-gray-300 hover:text-red-500 p-1 self-start mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove service"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={svc.description}
                    onChange={(e) => updateService(i, "description", e.target.value)}
                    className="w-full mt-3 text-xs text-gray-500 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none pb-1 placeholder-gray-300 transition-colors"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addService}
                className="w-full text-sm text-blue-600 font-semibold py-3 rounded-2xl border-2 border-dashed border-blue-200 hover:bg-blue-50 transition-colors"
              >
                + Add another service
              </button>
            </div>
          </Card>
        )}

        {/* Step 3 — AI name & greeting shown for all plans; demo call only for Pro/Multi */}
        {step === 3 && (
          <div className={isVoicePlan ? "grid md:grid-cols-2 gap-6 items-start" : ""}>
            <Card>
              <StepHeader
                icon={<Sparkles size={22} />}
                title="Meet your AI"
                subtitle="Give your AI a name and a greeting."
                benefit="Patients will see and hear this every time they interact with your practice."
              />
              <div className="space-y-6 max-w-xl">
                <Labeled label="AI name">
                  <input
                    type="text"
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    placeholder="e.g. Claire, Sophia, Alex"
                    className={inputCls}
                  />
                </Labeled>
                <Labeled label="Greeting" hint={isVoicePlan ? "How your AI answers the phone or opens a chat." : "How your AI greets patients in the chat widget."}>
                  <textarea
                    rows={3}
                    value={aiGreeting}
                    onChange={(e) => setAiGreeting(e.target.value)}
                    placeholder={buildDefaultGreeting(aiName, businessName)}
                    className={`${inputCls} resize-none`}
                  />
                </Labeled>

                {/* Demo call — Pro/Multi only */}
                {isVoicePlan ? (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={playDemo}
                      disabled={demoStatus === "loading" || demoStatus === "ringing" || demoStatus === "speaking"}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-blue-700 disabled:opacity-60 transition-colors"
                    >
                      {demoStatus === "loading" && <Loader2 size={16} className="animate-spin" />}
                      {demoStatus === "ringing" && <Phone size={16} className="animate-pulse" />}
                      {demoStatus === "speaking" && <Mic size={16} className="animate-pulse" />}
                      {(demoStatus === "idle" || demoStatus === "error") && <Phone size={16} />}
                      {demoStatus === "loading" ? "Preparing..." : demoStatus === "ringing" ? "Ringing..." : demoStatus === "speaking" ? "Speaking..." : "Hear your AI"}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">This is how your AI sounds to patients.</p>
                  </div>
                ) : (
                  <div className="pt-2 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">Voice AI is available on the Pro plan.</span>{" "}
                      Upgrade after setup to hear your AI and enable voice phone answering.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Live phone preview — Pro/Multi only */}
            {isVoicePlan && (
              <div className="sticky top-28">
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 shadow-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Live preview</span>
                    </div>
                    <Phone size={14} className="text-slate-500" />
                  </div>
                  <div className="bg-slate-800/50 rounded-2xl p-5 space-y-4 min-h-[300px]">
                    <div className="text-xs text-slate-500">Incoming patient call · {businessName || "Your practice"}</div>
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {(aiName || "AI").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 bg-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-sm text-white leading-relaxed">
                          {aiGreeting.trim() || buildDefaultGreeting(aiName, businessName)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 justify-end">
                      <div className="flex-1 bg-blue-500/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                        <p className="text-sm text-blue-100">Hi, do you have any openings this week for a cleaning?</p>
                      </div>
                    </div>
                    {services.filter((s) => s.name.trim()).length > 0 && (
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {(aiName || "AI").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 bg-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
                          <p className="text-sm text-white leading-relaxed">
                            Absolutely! A {services.find((s) => /clean/i.test(s.name))?.name ?? services.find((s) => s.name.trim())?.name} takes about {services.find((s) => /clean/i.test(s.name))?.durationMinutes ?? services.find((s) => s.name.trim())?.durationMinutes} minutes. I can check availability for you now.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-600 text-center mt-4 uppercase tracking-widest">Updates as you type</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <Card>
            <StepHeader
              icon={<Siren size={22} className="text-red-500" />}
              title="Who should we alert for emergencies?"
              subtitle="When a patient reports a dental emergency, we'll reach out immediately."
              benefit="Never miss an urgent patient call — even after hours."
            />
            <div className="space-y-5 max-w-xl">
              <Labeled label="Phone (SMS)" hint="We'll text you the patient's name, number, and issue.">
                <input
                  type="tel"
                  value={notifyPhone}
                  onChange={(e) => setNotifyPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={inputCls}
                />
              </Labeled>
              <Labeled label="Email" hint="Full conversation transcript delivered instantly.">
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="you@practice.com"
                  className={inputCls}
                />
              </Labeled>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                <Bell size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Strongly recommended</p>
                  <p className="text-xs text-amber-700 mt-1">You can skip this, but emergencies won't alert you if no contact is set.</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <Card>
            <StepHeader
              icon={<Calendar size={22} />}
              title="Connect Open Dental"
              subtitle="Optional — connect now or later from Settings."
              benefit="Lets your AI book appointments directly into your calendar."
            />
            <div className="space-y-5 max-w-xl">
              <Labeled label="Server endpoint URL">
                <input
                  type="url"
                  value={odServerUrl}
                  onChange={(e) => setOdServerUrl(e.target.value)}
                  placeholder="https://api.opendental.com/..."
                  className={inputCls}
                />
              </Labeled>
              <Labeled label="Developer API key">
                <input
                  type="password"
                  value={odApiKey}
                  onChange={(e) => setOdApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className={inputCls}
                />
              </Labeled>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-600">No Open Dental account yet? No problem — your AI will collect booking requests for your team to confirm manually. You can connect Open Dental anytime from Settings.</p>
              </div>
            </div>
          </Card>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between max-w-5xl mx-auto mt-8">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 disabled:opacity-0 transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            {(step === 4 || step === 5) && (
              <button
                type="button"
                onClick={step === 5 ? handleSubmit : next}
                disabled={loading}
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 px-4 py-2 transition-colors"
              >
                Skip for now
              </button>
            )}
            {step < 5 ? (
              <button
                type="button"
                onClick={next}
                className="bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-full shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-xl transition-all"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-full shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-60 transition-all"
              >
                {loading ? "Creating..." : "Finish setup →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 md:p-10 max-w-3xl mx-auto">
      {children}
    </div>
  );
}

function StepHeader({
  icon,
  title,
  subtitle,
  benefit,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  benefit: string;
}) {
  return (
    <div className="mb-8">
      <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 mb-4">
        {icon}
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">{title}</h1>
      <p className="text-gray-500 text-sm mb-3">{subtitle}</p>
      <p className="text-xs text-gray-400 italic border-l-2 border-blue-200 pl-3">{benefit}</p>
    </div>
  );
}

function Labeled({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}
