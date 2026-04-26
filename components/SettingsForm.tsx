"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, User, Bot, PhoneCall, Zap, Save, AlertCircle, ChevronDown, LayoutList, Clock, ToggleLeft, Sparkles, CalendarCheck, Moon, ListOrdered, Siren, ShieldCheck, UserPlus, DollarSign, CreditCard, Bell, Play, Square, UserCircle2, Trash2, ExternalLink, Layout } from "lucide-react";
import HoursPicker, { type WeeklyHours, parseHours } from "@/components/HoursPicker";
import { FEATURE_DEFINITIONS, GROUP_LABELS, type FeatureDefinition } from "@/lib/ai-features";
import { getServiceDefaults, buildDefaultGreeting } from "@/lib/service-defaults";

type FAQ = { question: string; answer: string };
type VoiceTone = "sarah" | "emma" | "james" | "marcus" | "professional" | "warm" | "clinical";
type Service = { name: string; durationMinutes: number; description: string };

// Generic hook for managing arrays of items (add, update, remove)
function useArrayState<T>(initial: T[], emptyItem: T) {
  const [items, setItems] = useState(initial);
  return {
    items,
    add: () => setItems((arr) => [...arr, emptyItem]),
    update: (i: number, field: keyof T, value: T[keyof T]) =>
      setItems((arr) => arr.map((item, idx) => (idx === i ? { ...item, [field]: value } : item))),
    remove: (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i)),
  };
}

type Business = {
  id?: string;
  name: string;
  business_type: string;
  hours: unknown;
  services: unknown;
  ai_name: string;
  ai_greeting: string | null;
  custom_prompt: string | null;
  faqs: FAQ[];
  plan: string;
  plan_status: string | null;
  stripe_customer_id: string | null;
  current_period_end: string | null;
  billing_cycle: "monthly" | "annual" | null;
  voice_enabled: boolean;
  twilio_sid: string | null;
  voice_tone: VoiceTone | null;
  voice_emergency_number: string | null;
  voice_emergency_message: string | null;
  voice_deflect_topics: string[] | null;
  voice_scenarios: string[] | null;
  opendental_server_url: string | null;
  opendental_api_key: string | null;
  opendental_booking_mode: "autonomous" | "pending" | "collect_only" | null;
  opendental_booking_window: number | null;
  ai_dos: string | null;
  ai_donts: string | null;
  ai_features: string[] | null;
  widget_config?: {
    primary_color?: string;
    user_bubble_color?: string;
    ai_bubble_color?: string;
    logo_url?: string | null;
    header_title?: string;
    button_label?: string;
    greeting_enabled?: boolean;
    greeting_text?: string;
    show_branding?: boolean;
  } | null;
  notify_on_emergency: boolean | null;
  notify_emergency_phone: string | null;
  notify_emergency_email: string | null;
  notify_emergency_whatsapp: string | null;
  notify_on_new_booking: boolean | null;
  notify_on_callback: boolean | null;
};

const DENTAL_DEFAULTS: Service[] = [
  { name: "New Patient Exam", durationMinutes: 90, description: "Includes X-rays and full periodontal evaluation" },
  { name: "Adult Cleaning (Prophy)", durationMinutes: 60, description: "" },
  { name: "Child Cleaning", durationMinutes: 30, description: "" },
  { name: "Crown Prep", durationMinutes: 90, description: "" },
  { name: "Root Canal", durationMinutes: 90, description: "" },
  { name: "Extraction", durationMinutes: 60, description: "" },
  { name: "Emergency Visit", durationMinutes: 30, description: "Same-day pain triage" },
  { name: "Consultation", durationMinutes: 30, description: "" },
];

const VOICES: { key: VoiceTone; name: string; gender: "Female" | "Male"; tone: string; desc: string }[] = [
  { key: "sarah",  name: "Sarah",  gender: "Female", tone: "Warm & Friendly",          desc: "Approachable and caring. Perfect for pediatric and family dental." },
  { key: "emma",   name: "Emma",   gender: "Female", tone: "Clinical & Precise",        desc: "Clear and efficient. Ideal for oral surgery and specialist practices." },
  { key: "james",  name: "James",  gender: "Male",   tone: "Professional & Efficient",  desc: "Confident and direct. Great for busy front desk energy." },
  { key: "marcus", name: "Marcus", gender: "Male",   tone: "Warm & Approachable",       desc: "Friendly and calm. Builds strong patient rapport." },
];

const DEFLECT_PRESETS: { key: string; label: string }[] = [
  { key: "appointments",        label: "Appointment requests" },
  { key: "insurance",           label: "Insurance inquiries" },
  { key: "clinical_advice",      label: "Clinical/medical advice" },
];

const SCENARIOS = [
  { key: "new_patient",    label: "New patient inquiry",     description: "Collect name + contact, office will follow up." },
  { key: "appointment",    label: "Appointment scheduling",  description: "Acknowledge, collect preferred time." },
];

const TABS = [
  { id: "profile",       label: "Practice Profile",  icon: User },
  { id: "services",      label: "Services",           icon: LayoutList },
  { id: "ai",           label: "AI Configuration",   icon: Bot },
  { id: "features",     label: "Features",            icon: Sparkles },
  { id: "widget",       label: "Widget",              icon: Layout },
  { id: "voice",        label: "Voice Settings",      icon: PhoneCall },
  { id: "dos_donts",    label: "Do's & Don'ts",       icon: ToggleLeft },
  { id: "notifications", label: "Notifications",      icon: Bell },
  { id: "integrations",  label: "Integrations",       icon: Zap },
];

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  growth: "Growth",
  multi: "Multi-Practice",
};

export default function SettingsForm({ business, forLocationId }: { business: Business; forLocationId?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(business.name);
  const [businessType, setBusinessType] = useState(business.business_type);
  const [hours, setHours] = useState<WeeklyHours>(() => parseHours(business.hours));

  const initializeServices = (): Service[] => {
    const raw = business.services;
    if (Array.isArray(raw) && raw.length > 0) {
      const first = raw[0] as Record<string, unknown>;
      if (first && typeof first === "object" && "durationMinutes" in first) {
        return raw as Service[];
      }
      return (raw as Array<{ name?: string } | string>).map((s) => ({
        name: typeof s === "string" ? s : s.name ?? "",
        durationMinutes: 60,
        description: "",
      }));
    }
    if (typeof raw === "string" && raw.trim()) {
      return raw.split(",").map((s) => ({ name: s.trim(), durationMinutes: 60, description: "" }));
    }
    const defaults = getServiceDefaults(business.business_type);
    return defaults.map((d) => ({ name: d.name, durationMinutes: d.durationMinutes, description: d.description }));
  };

  const { items: serviceItems, add: addService, update: updateService, remove: removeService } = useArrayState(initializeServices(), { name: "", durationMinutes: 60, description: "" });

  const [aiName, setAiName] = useState(business.ai_name ?? "Claire");
  const [aiGreeting, setAiGreeting] = useState(business.ai_greeting ?? "");
  const [customPrompt, setCustomPrompt] = useState(business.custom_prompt ?? "");
  const [aiDos, setAiDos] = useState(business.ai_dos ?? "");
  const [aiDonts, setAiDonts] = useState(business.ai_donts ?? "");
  const [aiFeatures, setAiFeatures] = useState<string[]>(business.ai_features ?? []);

  const [widgetPrimaryColor, setWidgetPrimaryColor] = useState(business.widget_config?.primary_color ?? '#2563eb');
  const [widgetUserBubbleColor, setWidgetUserBubbleColor] = useState(business.widget_config?.user_bubble_color ?? '#2563eb');
  const [widgetAiBubbleColor, setWidgetAiBubbleColor] = useState(business.widget_config?.ai_bubble_color ?? '#f3f4f6');
  const [widgetLogoUrl, setWidgetLogoUrl] = useState(business.widget_config?.logo_url ?? '');
  const [widgetHeaderTitle, setWidgetHeaderTitle] = useState(business.widget_config?.header_title ?? '');
  const [widgetButtonLabel, setWidgetButtonLabel] = useState(business.widget_config?.button_label ?? '');
  const [widgetGreetingEnabled, setWidgetGreetingEnabled] = useState(business.widget_config?.greeting_enabled ?? false);
  const [widgetGreetingText, setWidgetGreetingText] = useState(business.widget_config?.greeting_text ?? '');
  const [widgetShowBranding, setWidgetShowBranding] = useState(business.widget_config?.show_branding ?? true);
  const [widgetLogoUploading, setWidgetLogoUploading] = useState(false);

  const [notifySettings, setNotifySettings] = useState({
    emergency: {
      enabled: business.notify_on_emergency ?? true,
      phone: business.notify_emergency_phone ?? "",
      email: business.notify_emergency_email ?? "",
      whatsapp: business.notify_emergency_whatsapp ?? "",
    },
    booking: { enabled: business.notify_on_new_booking ?? false },
    callback: { enabled: business.notify_on_callback ?? false },
  });

  const updateNotify = (key: 'emergency' | 'booking' | 'callback', field: string, value: unknown) => {
    setNotifySettings((s) => ({ ...s, [key]: { ...s[key], [field]: value } }));
  };

  const { items: faqs, add: addFaq, update: updateFaq, remove: removeFaq } = useArrayState(business.faqs ?? [], { question: "", answer: "" });
  
  const [voiceEnabled, setVoiceEnabled] = useState(business.voice_enabled ?? false);
  const [voiceTone, setVoiceTone] = useState<VoiceTone>(
    VOICES.some(v => v.key === business.voice_tone) ? business.voice_tone as VoiceTone : "sarah"
  );
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [voiceEmergencyNumber, setVoiceEmergencyNumber] = useState(business.voice_emergency_number ?? "");
  const [voiceEmergencyMessage, setVoiceEmergencyMessage] = useState(business.voice_emergency_message ?? "");
  const [voiceDeflectTopics, setVoiceDeflectTopics] = useState<string[]>(business.voice_deflect_topics ?? []);
  const [voiceScenarios, setVoiceScenarios] = useState<string[]>(business.voice_scenarios ?? []);
  
  const [odServerUrl, setOdServerUrl] = useState(business.opendental_server_url ?? "");
  const [odApiKey, setOdApiKey] = useState(business.opendental_api_key ?? "");
  const [odTestStatus, setOdTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const isOdConnected = !!business.opendental_api_key;

  const hasVoice = business.plan === "pro" || business.plan === "multi";

  // Account tab state
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm" | "email_sent">("idle");
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleOpenPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank", "noopener");
      else setError("Could not open billing portal. Please try again.");
    } catch { setError("Could not open billing portal."); }
    finally { setPortalLoading(false); }
  }

  async function handleRequestDeletion() {
    if (deleteInput !== "DELETE") return;
    setDeleteLoading(true); setDeleteError("");
    try {
      const res = await fetch("/api/account/request-deletion", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send deletion email");
      setDeleteStep("email_sent");
    } catch (e) { setDeleteError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setDeleteLoading(false); }
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  function stopPreview() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    setPlayingVoice(null);
  }

  function handlePreview(key: string) {
    if (playingVoice === key) { stopPreview(); return; }
    stopPreview();
    setPlayingVoice(key);
    const audio = new Audio(`/voices/${key}.mp3`);
    audioRef.current = audio;
    audio.addEventListener("ended", stopPreview);
    audio.play().catch(() => {
      // File not yet added — waveform animation still plays, audio fails silently
    });
    // 15s safety cap in case audio is long or stalls
    previewTimerRef.current = setTimeout(stopPreview, 15000);
  }

  function toggleDeflect(key: string) {
    setVoiceDeflectTopics((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }
  function toggleScenario(key: string) {
    setVoiceScenarios((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }
  function toggleFeature(key: string) {
    setAiFeatures((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }

  const featureIconMap: Record<string, React.ReactNode> = {
    CalendarCheck: <CalendarCheck size={18} />,
    Moon: <Moon size={18} />,
    ListOrdered: <ListOrdered size={18} />,
    Siren: <Siren size={18} />,
    ShieldCheck: <ShieldCheck size={18} />,
    UserPlus: <UserPlus size={18} />,
    DollarSign: <DollarSign size={18} />,
    CreditCard: <CreditCard size={18} />,
  };

  async function handleTestConnection() {
    setOdTestStatus("testing");
    try {
      const res = await fetch("/api/settings/opendental-test", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverUrl: odServerUrl, apiKey: odApiKey }),
      });
      if ((await res.json()).ok) setOdTestStatus("ok");
      else setOdTestStatus("error");
    } catch { setOdTestStatus("error"); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, businessType, hours, services: serviceItems.filter((s) => s.name.trim()), aiName, aiGreeting, customPrompt,
          faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
          aiDos: aiDos || null, aiDonts: aiDonts || null, aiFeatures,
          notifyOnEmergency: notifySettings.emergency.enabled,
          notifyEmergencyPhone: notifySettings.emergency.phone || null,
          notifyEmergencyEmail: notifySettings.emergency.email || null,
          notifyEmergencyWhatsapp: notifySettings.emergency.whatsapp || null,
          notifyOnNewBooking: notifySettings.booking.enabled,
          notifyOnCallback: notifySettings.callback.enabled,
          voiceEnabled, voiceTone, voiceEmergencyNumber: voiceEmergencyNumber || null, voiceEmergencyMessage: voiceEmergencyMessage || null,
          voiceDeflectTopics, voiceScenarios, openDentalServerUrl: odServerUrl || null, openDentalApiKey: odApiKey || null,
          widget_config: {
            primary_color: widgetPrimaryColor,
            user_bubble_color: widgetUserBubbleColor,
            ai_bubble_color: widgetAiBubbleColor,
            logo_url: widgetLogoUrl || null,
            header_title: widgetHeaderTitle,
            button_label: widgetButtonLabel,
            greeting_enabled: widgetGreetingEnabled,
            greeting_text: widgetGreetingText,
            show_branding: widgetShowBranding,
          },
          ...(forLocationId ? { businessId: forLocationId } : {}),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 bg-[#fafafa] rounded-3xl min-h-[600px] border border-gray-200 overflow-hidden shadow-2xl">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-gray-50/50 p-6 border-r border-gray-200 hidden md:block flex flex-col">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Settings</h3>
        <ul className="space-y-2 flex-1">
          {TABS.map(tab => (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-900/5"
                  : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? "text-blue-600" : "text-gray-400"} />
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Account tab — separated at bottom */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "account"
              ? "bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-200"
              : "text-orange-500 hover:bg-orange-50/60 hover:text-orange-600"
            }`}
          >
            <UserCircle2 size={18} className={activeTab === "account" ? "text-orange-600" : "text-orange-400"} />
            Account
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 bg-white overflow-y-auto">
        
        {/* PROFILE TAB */}
        <div className={activeTab === "profile" ? "block" : "hidden"}>
          <div className="mb-8 border-b border-gray-100 pb-5">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Practice Profile</h2>
            <p className="text-gray-500 text-sm mt-1">General information about your office.</p>
          </div>
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <Field label="Practice name">
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Specialty">
                <div className="relative">
                  <select value={businessType} onChange={e => setBusinessType(e.target.value)} className={`${inputCls} appearance-none pr-10 cursor-pointer`}>
                    <option value="dental">General Dental</option>
                    <option value="orthodontics">Orthodontics</option>
                    <option value="oral_surgery">Oral Surgery</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </Field>
            </div>
            <div className="pt-4">
              <Field label="Business Hours"><HoursPicker value={hours} onChange={setHours} /></Field>
            </div>
          </div>
        </div>

        {/* SERVICES TAB */}
        <div className={activeTab === "services" ? "block" : "hidden"}>
          <div className="mb-8 border-b border-gray-100 pb-5 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Services</h2>
              <p className="text-gray-500 text-sm mt-1">Define the treatments you offer and how long each one takes. Duration is used to book the right time slot in Open Dental.</p>
            </div>
            <button
              type="button"
              onClick={addService}
              className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100 transition-colors shrink-0"
            >
              + Add Service
            </button>
          </div>

          <div className="max-w-2xl space-y-1">
            {serviceItems.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <LayoutList size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">No services yet</p>
                <p className="text-xs mt-1">Add your first service above</p>
              </div>
            )}

            {serviceItems.map((svc, i) => (
              <div key={i} className="group flex gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-3 hover:border-gray-300 transition-colors">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Service Name</p>
                      <input
                        type="text"
                        placeholder="e.g. Adult Cleaning"
                        value={svc.name}
                        onChange={e => updateService(i, "name", e.target.value)}
                        className="w-full text-sm font-semibold bg-transparent border-b border-gray-300 focus:border-blue-600 outline-none pb-1 placeholder-gray-300 transition-colors"
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
                          onChange={e => updateService(i, "durationMinutes", Math.max(5, parseInt(e.target.value) || 5))}
                          className="w-16 text-sm font-semibold text-center bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        />
                        <span className="text-xs text-gray-400 font-medium">min</span>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Description (optional — shown to patients)"
                    value={svc.description}
                    onChange={e => updateService(i, "description", e.target.value)}
                    className="w-full text-xs text-gray-500 bg-transparent border-b border-gray-200 focus:border-blue-600 outline-none pb-1 placeholder-gray-300 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeService(i)}
                  className="text-gray-300 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all self-start mt-1"
                >
                  <X size={15} />
                </button>
              </div>
            ))}

            {serviceItems.length > 0 && (
              <button
                type="button"
                onClick={addService}
                className="w-full mt-2 border-2 border-dashed border-gray-200 rounded-2xl py-3 text-sm text-gray-400 font-medium hover:border-blue-300 hover:text-blue-500 transition-all"
              >
                + Add another service
              </button>
            )}
          </div>
        </div>

        {/* AI CONFIG TAB */}
        <div className={activeTab === "ai" ? "block" : "hidden"}>
          <div className="mb-8 border-b border-gray-100 pb-5">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI Personality</h2>
            <p className="text-gray-500 text-sm mt-1">Define how your agent responds and answers FAQs.</p>
          </div>
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
               <Field label="Agent Name"><input type="text" value={aiName} onChange={e => setAiName(e.target.value)} className={inputCls} /></Field>
               <Field label="Custom Greeting"><input type="text" value={aiGreeting} onChange={e => setAiGreeting(e.target.value)} className={inputCls} placeholder={buildDefaultGreeting(aiName, name)} /></Field>
            </div>
            <Field label="System Prompt" hint="Direct operating instructions for the LLM">
              <textarea rows={4} value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} className={inputCls} placeholder="Always offer the new patient special..." />
            </Field>

            <div className="pt-6 mt-6 border-t border-gray-100">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-sm font-bold text-gray-700">Patient FAQs</h3>
                 <button type="button" onClick={addFaq} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold">+ Add FAQ</button>
               </div>
               <p className="text-sm text-gray-500 mb-4">Add your practice&apos;s most common questions and answers below. Your AI will use these to respond accurately to patients.</p>
               {faqs.map((faq, i) => (
                 <div key={i} className="flex gap-3 mb-3 bg-gray-50 p-3 rounded-xl border border-gray-200 relative group">
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="If asked about..." value={faq.question} onChange={e => updateFaq(i, "question", e.target.value)} className="w-full text-sm font-medium bg-transparent border-b border-gray-300 focus:border-blue-600 outline-none pb-1 placeholder-gray-400" />
                      <input type="text" placeholder="Say exactly..." value={faq.answer} onChange={e => updateFaq(i, "answer", e.target.value)} className="w-full text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-600 outline-none pb-1 placeholder-gray-400" />
                    </div>
                    <button type="button" onClick={() => removeFaq(i)} className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* VOICE TAB */}
        <div className={activeTab === "voice" ? "block" : "hidden"}>
          <div className="mb-8 border-b border-gray-100 pb-5 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Voice Calling</h2>
              <p className="text-gray-500 text-sm mt-1">Configure your telephone and routing.</p>
            </div>
            {hasVoice && (
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="sr-only" checked={voiceEnabled} onChange={() => setVoiceEnabled(!voiceEnabled)} />
                <div className={`relative w-14 h-7 rounded-full transition-all duration-200 shadow-inner ${voiceEnabled ? 'bg-blue-600 shadow-blue-200' : 'bg-gray-200'}`}>
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-200 shadow-md ${voiceEnabled ? 'left-8' : 'left-1'}`} />
                </div>
                <span className={`text-xs font-black tracking-tight transition-colors ${voiceEnabled ? 'text-blue-600 animate-soft-flicker' : 'text-gray-400'}`}>
                  {voiceEnabled ? 'LIVE' : 'OFF'}
                </span>
              </label>
            )}
          </div>

          {!hasVoice ? (
             <div className="bg-gray-900 text-white rounded-2xl p-8 text-center max-w-xl mx-auto mt-10">
                <Zap size={40} className="text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Upgrade to Voice Automation</h3>
                <p className="text-gray-400 text-sm mb-6">Answer calls 24/7 without lifting a finger.</p>
                <div className="flex justify-center"><button onClick={() => router.push('/pricing')} type="button" className="bg-blue-600 px-6 py-2 rounded-xl font-bold">View Plans</button></div>
             </div>
          ) : (
            <div className="space-y-8 max-w-2xl">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex justify-between items-center">
                 <div>
                   <p className="text-xs text-blue-800 font-bold uppercase tracking-wider mb-1">Your Virtual Number</p>
                   <p className="font-mono text-lg text-blue-900">{business.twilio_sid || "Provisioning..."}</p>
                 </div>
                 <div className="text-xs text-blue-600 bg-white px-3 py-1.5 rounded-lg shadow-sm font-semibold">Active</div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Voice</h3>
                <div className="space-y-3">
                  {VOICES.map(v => {
                    const isSelected = voiceTone === v.key;
                    const isPreviewing = playingVoice === v.key;
                    return (
                      <div
                        key={v.key}
                        onClick={() => setVoiceTone(v.key)}
                        className={`cursor-pointer w-full rounded-2xl border-2 transition-colors duration-150 select-none shadow-sm ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {isPreviewing ? (
                          <div className="px-5 py-4 flex items-center gap-4">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handlePreview(v.key); }}
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                              <Square size={14} className="text-white" fill="white" />
                            </button>
                            <VoiceWaveform name={v.name} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-5 px-5 py-4">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handlePreview(v.key); }}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                isSelected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              <Play size={15} className={isSelected ? 'text-white' : 'text-gray-500'} fill="currentColor" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <p className={`font-black text-sm tracking-tight shrink-0 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{v.name}</p>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${v.gender === "Female" ? 'bg-pink-50 text-pink-500' : 'bg-sky-50 text-sky-500'}`}>{v.gender}</span>
                                <span className="text-[10px] font-semibold text-gray-400 truncate">{v.tone}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">{v.desc}</p>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Active</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                 <h3 className="text-sm font-bold text-gray-700 mb-4">Smart Handoffs — transfer complex calls to your team</h3>
                 <div className="space-y-3">
                   {DEFLECT_PRESETS.map(p => (
                      <label key={p.key} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100">
                         <input type="checkbox" checked={voiceDeflectTopics.includes(p.key)} onChange={() => toggleDeflect(p.key)} className="w-4 h-4 accent-blue-600 rounded cursor-pointer" />
                         <span className="text-sm font-medium text-gray-800">{p.label} - <span className="text-gray-500 font-normal">Transfers to desk instead of answering</span></span>
                      </label>
                   ))}
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* FEATURES TAB */}
        <div className={activeTab === "features" ? "block" : "hidden"}>
          <div className="mb-8 border-b border-gray-100 pb-5">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI Features</h2>
            <p className="text-gray-500 text-sm mt-1">Toggle capabilities on or off. Active features are applied to both chat and voice interactions.</p>
          </div>
          <div className="max-w-2xl">
            {(Object.keys(GROUP_LABELS) as Array<FeatureDefinition['group']>).map((group) => {
              const groupFeatures = FEATURE_DEFINITIONS.filter((f) => f.group === group);
              return (
                <div key={group} className="mb-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{GROUP_LABELS[group]}</h3>
                  <div className="space-y-3">
                    {groupFeatures.map((feature) => {
                      const isOn = aiFeatures.includes(feature.key);
                      return (
                        <div
                          key={feature.key}
                          onClick={() => toggleFeature(feature.key)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isOn ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isOn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {featureIconMap[feature.icon]}
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold text-sm ${isOn ? 'text-gray-900' : 'text-gray-500'}`}>
                              {feature.label}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{feature.description}</p>
                          </div>
                          <div
                            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                              isOn ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                                isOn ? 'left-6' : 'left-1'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NOTIFICATIONS TAB */}
        <div className={activeTab === "notifications" ? "block" : "hidden"}>
          <div className="mb-8 border-b border-gray-100 pb-5">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h2>
            <p className="text-gray-500 text-sm mt-1">Get alerted when your AI handles important situations. All flagged items also appear in your dashboard inbox.</p>
          </div>
          <div className="max-w-2xl space-y-4">

            {/* Emergency Alerts */}
            <div className={`rounded-2xl border-2 overflow-hidden transition-all ${notifySettings.emergency.enabled ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-white'}`}>
              <div
                onClick={() => updateNotify('emergency', 'enabled', !notifySettings.emergency.enabled)}
                className="flex items-center gap-4 p-4 cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${notifySettings.emergency.enabled ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Siren size={20} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${notifySettings.emergency.enabled ? 'text-gray-900' : 'text-gray-500'}`}>Emergency Alerts</p>
                  <p className="text-xs text-gray-400 mt-0.5">Get notified immediately when a patient reports a dental emergency.</p>
                </div>
                <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifySettings.emergency.enabled ? 'bg-red-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${notifySettings.emergency.enabled ? 'left-6' : 'left-1'}`} />
                </div>
              </div>
              {notifySettings.emergency.enabled && (
                <div className="px-4 pb-4 space-y-3 border-t border-red-100 pt-4">
                  <p className="text-xs text-gray-500 font-medium">Add at least one contact below. Leave any field empty to skip that channel.</p>
                  <Field label="SMS / Phone number">
                    <input type="tel" value={notifySettings.emergency.phone} onChange={e => updateNotify('emergency', 'phone', e.target.value)} className={inputCls} placeholder="+1 (555) 000-0000" />
                  </Field>
                  <Field label="Email address">
                    <input type="email" value={notifySettings.emergency.email} onChange={e => updateNotify('emergency', 'email', e.target.value)} className={inputCls} placeholder="doctor@practice.com" />
                  </Field>
                  <Field label="WhatsApp number">
                    <input type="tel" value={notifySettings.emergency.whatsapp} onChange={e => updateNotify('emergency', 'whatsapp', e.target.value)} className={inputCls} placeholder="+1 (555) 000-0000" />
                    <p className="text-[11px] text-gray-400 mt-1">WhatsApp requires Twilio WhatsApp setup. Contact support to enable.</p>
                  </Field>
                </div>
              )}
            </div>

            {/* New Booking Requests */}
            <div
              onClick={() => updateNotify('booking', 'enabled', !notifySettings.booking.enabled)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${notifySettings.booking.enabled ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${notifySettings.booking.enabled ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <CalendarCheck size={20} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${notifySettings.booking.enabled ? 'text-gray-900' : 'text-gray-500'}`}>New Booking Requests</p>
                <p className="text-xs text-gray-400 mt-0.5">Get notified when a patient submits a booking request. Uses your emergency contact details above.</p>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifySettings.booking.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${notifySettings.booking.enabled ? 'left-6' : 'left-1'}`} />
              </div>
            </div>

            {/* Callback Requests */}
            <div
              onClick={() => updateNotify('callback', 'enabled', !notifySettings.callback.enabled)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${notifySettings.callback.enabled ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${notifySettings.callback.enabled ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <PhoneCall size={20} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${notifySettings.callback.enabled ? 'text-gray-900' : 'text-gray-500'}`}>Callback Requests</p>
                <p className="text-xs text-gray-400 mt-0.5">Get notified when a patient asks to be called back. Uses your emergency contact details above.</p>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifySettings.callback.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${notifySettings.callback.enabled ? 'left-6' : 'left-1'}`} />
              </div>
            </div>

            <p className="text-xs text-gray-400 pt-2">All flagged conversations also appear in the <strong>Action Required</strong> inbox on your dashboard, regardless of these notification settings.</p>
          </div>
        </div>

        {/* DO'S & DON'TS TAB */}
        <div className={activeTab === "dos_donts" ? "block" : "hidden"}>
          <div className="mb-8 border-b border-gray-100 pb-5">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Do&apos;s &amp; Don&apos;ts</h2>
            <p className="text-gray-500 text-sm mt-1">Control exactly what your AI will and won&apos;t say. These rules are applied on every conversation.</p>
          </div>
          <div className="space-y-6 max-w-2xl">
            {/* Do's */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-green-100 border border-green-300 flex items-center justify-center shrink-0">
                  <Check size={11} className="text-green-600 stroke-[3]" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Do&apos;s</h3>
              </div>
              <p className="text-xs text-gray-400 mb-3">Things you want your AI to always do or say.</p>
              <textarea
                rows={8}
                value={aiDos}
                onChange={e => setAiDos(e.target.value)}
                placeholder={"Always offer the next available appointment\nConfirm insurance before booking\nMention the new patient special\nAsk for patient name and best callback number"}
                className="w-full border-2 border-green-200 focus:border-green-400 rounded-2xl px-4 py-3 text-sm resize-none outline-none transition-all bg-green-50/30 placeholder-gray-300 leading-relaxed"
              />
            </div>

            {/* Don'ts */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0">
                  <X size={11} className="text-red-500 stroke-[3]" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Don&apos;ts</h3>
              </div>
              <p className="text-xs text-gray-400 mb-3">Things you never want your AI to do or say.</p>
              <textarea
                rows={8}
                value={aiDonts}
                onChange={e => setAiDonts(e.target.value)}
                placeholder={"Never quote prices over the phone\nDo not book same-day appointments\nNever discuss clinical diagnoses\nDo not mention competitor practices"}
                className="w-full border-2 border-red-200 focus:border-red-400 rounded-2xl px-4 py-3 text-sm resize-none outline-none transition-all bg-red-50/30 placeholder-gray-300 leading-relaxed"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 max-w-xl">
            One rule per line. These are merged with your system prompt and applied to both voice calls and chat conversations.
          </p>
        </div>

        {/* INTEGRATIONS TAB */}
        <div className={activeTab === "integrations" ? "block" : "hidden"}>
          <div className="mb-8 border-b border-gray-100 pb-5">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">App Integrations</h2>
            <p className="text-gray-500 text-sm mt-1">Connect your practice management system to enable live scheduling and patient record sync.</p>
          </div>

          <div className="max-w-2xl space-y-4">
            {/* OpenDental Card */}
            <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${isOdConnected ? 'border-green-400 shadow-md shadow-green-50' : 'border-gray-200 shadow-sm hover:border-gray-300'}`}>
              {/* Card Header */}
              <div className={`px-6 py-5 flex items-center justify-between ${isOdConnected ? 'bg-green-50/60' : 'bg-gray-50/50'}`}>
                <div className="flex items-center gap-4">
                  {/* OpenDental Logo Block */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isOdConnected ? 'bg-green-600 border-green-700' : 'bg-gray-900 border-gray-800'}`}>
                    <span className="text-white font-black text-xs tracking-tight leading-none text-center">
                      Open<br/>Dental
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-gray-900 tracking-tight">OpenDental</h3>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">PMS</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Live calendar sync · Autonomous booking · Patient records</p>
                  </div>
                </div>
                {isOdConnected ? (
                  <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">Connected</span>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">Not connected</div>
                )}
              </div>

              {/* Capability Badges */}
              <div className="px-6 py-3 bg-white border-t border-gray-100 flex flex-wrap gap-2">
                {['Real-time scheduling', 'Auto-confirm bookings', 'Patient record lookup', 'Availability sync'].map(cap => (
                  <span key={cap} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${isOdConnected ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    {isOdConnected ? '✓ ' : ''}{cap}
                  </span>
                ))}
              </div>

              {/* Credentials Form */}
              <div className="px-6 py-5 bg-white border-t border-gray-100 space-y-4">
                <Field label="Server Endpoint URL">
                  <input type="url" value={odServerUrl} onChange={e => setOdServerUrl(e.target.value)} className={inputCls} placeholder="https://api.opendental.com" />
                </Field>
                <Field label="Developer API Key">
                  <div className="flex gap-2">
                    <input type="password" value={odApiKey} onChange={e => setOdApiKey(e.target.value)} className={inputCls} placeholder="sk_live_..." />
                    <button type="button" onClick={handleTestConnection} className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shrink-0 whitespace-nowrap">Test Sync</button>
                  </div>
                </Field>
                {odTestStatus === "ok" && (
                  <div className="flex items-center gap-2 text-xs text-green-700 font-bold bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl">
                    <Check size={14} className="shrink-0" /> Valid connection — live scheduling is active
                  </div>
                )}
                {odTestStatus === "error" && (
                  <div className="flex items-center gap-2 text-xs text-red-600 font-bold bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
                    <AlertCircle size={14} className="shrink-0" /> Invalid credentials — check your API key and server URL
                  </div>
                )}
                <p className="text-[11px] text-gray-400 pt-1">
                  Your API key is stored encrypted and only used to communicate with your OpenDental server.
                  <a href="https://www.opendental.com/manual/apideveloper.html" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-500 hover:underline font-semibold">How to find your key →</a>
                </p>
              </div>
            </div>

            {/* More integrations coming soon */}
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
              <p className="text-sm font-bold text-gray-400">More integrations coming soon</p>
              <p className="text-xs text-gray-400 mt-1">Eaglesoft, Dentrix, and more on the roadmap.</p>
            </div>
          </div>
        </div>

        {/* WIDGET TAB */}
        {activeTab === 'widget' && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">Widget Customization</h2>

            <div className="flex gap-8">
              {/* Left: Controls */}
              <div className="flex-1 space-y-6">

                {/* Colors section */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Colors</h3>
                  <div className="space-y-4">

                    {/* Primary Color */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Primary Color</p>
                      <div className="flex items-center gap-3">
                        <input type="color" value={widgetPrimaryColor} onChange={e => setWidgetPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
                        <input type="text" value={widgetPrimaryColor} onChange={e => setWidgetPrimaryColor(e.target.value)}
                          className="w-28 text-sm font-mono bg-transparent border-b border-gray-300 focus:border-blue-600 outline-none pb-1" />
                        <span className="text-xs text-gray-400">Header, button &amp; accents</span>
                      </div>
                    </div>

                    {/* Patient Message Color */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Patient Message Color</p>
                      <div className="flex items-center gap-3">
                        <input type="color" value={widgetUserBubbleColor} onChange={e => setWidgetUserBubbleColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
                        <input type="text" value={widgetUserBubbleColor} onChange={e => setWidgetUserBubbleColor(e.target.value)}
                          className="w-28 text-sm font-mono bg-transparent border-b border-gray-300 focus:border-blue-600 outline-none pb-1" />
                        <span className="text-xs text-gray-400">Visitor&apos;s chat bubbles</span>
                      </div>
                    </div>

                    {/* AI Message Color */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">AI Message Color</p>
                      <div className="flex items-center gap-3">
                        <input type="color" value={widgetAiBubbleColor} onChange={e => setWidgetAiBubbleColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
                        <input type="text" value={widgetAiBubbleColor} onChange={e => setWidgetAiBubbleColor(e.target.value)}
                          className="w-28 text-sm font-mono bg-transparent border-b border-gray-300 focus:border-blue-600 outline-none pb-1" />
                        <span className="text-xs text-gray-400">AI response bubbles</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Branding section */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Branding</h3>
                  <div className="space-y-4">

                    {/* Logo */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Practice Logo</p>
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-blue-300 transition-all">
                        <input type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml" className="hidden" id="logo-upload"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setWidgetLogoUploading(true);
                            try {
                              const fd = new FormData();
                              fd.append('file', file);
                              const res = await fetch('/api/widget/upload-logo', { method: 'POST', body: fd });
                              const data = await res.json();
                              if (data.url) setWidgetLogoUrl(data.url);
                            } finally {
                              setWidgetLogoUploading(false);
                            }
                          }}
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100 transition-colors inline-block">
                          {widgetLogoUploading ? 'Uploading...' : '↑ Upload image'}
                        </label>
                        <p className="text-xs text-gray-400 my-2">— or paste a URL —</p>
                        <input type="text" value={widgetLogoUrl} onChange={e => setWidgetLogoUrl(e.target.value)}
                          placeholder="https://yourpractice.com/logo.png"
                          className="w-full text-sm bg-transparent border-b border-gray-300 focus:border-blue-600 outline-none pb-1 placeholder-gray-300 text-center" />
                        <p className="text-xs text-gray-400 mt-2">PNG, JPG or SVG · Max 2MB · Appears in chat header</p>
                      </div>
                    </div>

                    {/* Header Title */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Widget Header Title</p>
                      <input type="text" value={widgetHeaderTitle} onChange={e => setWidgetHeaderTitle(e.target.value)}
                        placeholder={`AI receptionist for ${business.name}`}
                        className="w-full text-sm font-medium bg-transparent border-b border-gray-300 focus:border-blue-600 outline-none pb-1 placeholder-gray-300 transition-colors" />
                      <p className="text-xs text-gray-400 mt-1.5">Shown at the top of the chat window</p>
                    </div>
                  </div>
                </div>

                {/* Chat Button section */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Chat Button</h3>
                  <div className="space-y-4">

                    {/* Button Label */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Button Label</p>
                      <input type="text" value={widgetButtonLabel} onChange={e => setWidgetButtonLabel(e.target.value)}
                        placeholder="e.g. Chat with us"
                        className="w-full text-sm font-medium bg-transparent border-b border-gray-300 focus:border-blue-600 outline-none pb-1 placeholder-gray-300 transition-colors" />
                      <p className="text-xs text-gray-400 mt-1.5">Optional text next to the button. Leave blank for icon only.</p>
                    </div>

                    {/* Greeting Bubble */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Greeting Bubble</p>
                          <p className="text-xs text-gray-500 mt-0.5">Show a message above the chat button</p>
                        </div>
                        <button type="button" onClick={() => setWidgetGreetingEnabled(!widgetGreetingEnabled)}
                          className={`relative w-14 h-7 rounded-full transition-all duration-200 shadow-inner ${widgetGreetingEnabled ? 'bg-blue-600 shadow-blue-200' : 'bg-gray-200'}`}>
                          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-200 shadow-md ${widgetGreetingEnabled ? 'left-8' : 'left-1'}`} />
                        </button>
                      </div>
                      {widgetGreetingEnabled && (
                        <input type="text" value={widgetGreetingText} onChange={e => setWidgetGreetingText(e.target.value)}
                          placeholder="Hi! How can we help you today?"
                          className="w-full text-sm font-medium bg-transparent border-b border-gray-300 focus:border-blue-600 outline-none pb-1 placeholder-gray-300 transition-colors mb-3" />
                      )}
                      <div className="bg-blue-50 rounded-xl px-3 py-2">
                        <p className="text-xs text-blue-700">
                          <strong>This floats above the closed chat button</strong> — visible before anyone clicks.
                          It is <strong>not</strong> the AI&apos;s first message. To edit what the AI says when the chat opens, go to the <strong>AI Config</strong> tab.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Powered by SalvaAI */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Powered by SalvaAI</h3>
                  {business.plan === 'basic' ? (
                    <div className="bg-gray-900 text-white rounded-2xl p-5 flex items-start gap-4">
                      <Zap size={20} className="text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-amber-400 text-black text-xs font-black px-2 py-0.5 rounded">PRO</span>
                          <span className="text-sm font-bold">Remove SalvaAI branding</span>
                        </div>
                        <p className="text-xs text-gray-400">Upgrade to Pro to remove the &quot;Powered by SalvaAI&quot; footer from your widget and give patients a fully branded experience.</p>
                        <button type="button" onClick={() => router.push('/pricing')} className="mt-3 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">View Plans</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Show &quot;Powered by SalvaAI&quot; in widget footer</p>
                          <p className="text-xs text-gray-400 mt-0.5">Turn off to give patients a fully branded experience</p>
                        </div>
                        <button type="button" onClick={() => setWidgetShowBranding(!widgetShowBranding)}
                          className={`relative w-14 h-7 rounded-full transition-all duration-200 shadow-inner ${widgetShowBranding ? 'bg-blue-600 shadow-blue-200' : 'bg-gray-200'}`}>
                          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-200 shadow-md ${widgetShowBranding ? 'left-8' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="w-64 shrink-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Preview</p>

                {/* Widget open state */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden mb-4" style={{ transform: 'scale(0.9)', transformOrigin: 'top right' }}>
                  {/* Header */}
                  <div className="p-3 flex items-center gap-2" style={{ background: widgetPrimaryColor }}>
                    {widgetLogoUrl ? (
                      <img src={widgetLogoUrl} alt="logo" className="w-7 h-7 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">AI</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{widgetHeaderTitle || `AI receptionist for ${business.name}`}</p>
                      <p className="text-white/70 text-[10px]">Online</p>
                    </div>
                  </div>
                  {/* Messages */}
                  <div className="p-3 bg-gray-50 space-y-2">
                    <div className="flex justify-start">
                      <div className="text-xs px-3 py-1.5 rounded-2xl rounded-tl-sm max-w-[80%]" style={{ background: widgetAiBubbleColor, color: '#1f2937' }}>
                        Hi! How can I help you today? 😊
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="text-white text-xs px-3 py-1.5 rounded-2xl rounded-tr-sm max-w-[80%]" style={{ background: widgetUserBubbleColor }}>
                        Do you accept new patients?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="text-xs px-3 py-1.5 rounded-2xl rounded-tl-sm max-w-[80%]" style={{ background: widgetAiBubbleColor, color: '#1f2937' }}>
                        Yes! We&apos;re welcoming new patients.
                      </div>
                    </div>
                  </div>
                  {/* Footer */}
                  {(widgetShowBranding || business.plan === 'basic') && (
                    <div className="py-1.5 text-center text-[9px] text-gray-400 border-t border-gray-100 bg-white">
                      Powered by SalvaAI
                    </div>
                  )}
                </div>

                {/* Widget closed state */}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Closed State</p>
                <div className="flex flex-col items-end gap-2">
                  {widgetGreetingEnabled && widgetGreetingText && (
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-br-sm shadow-md px-3 py-2 text-xs text-gray-700 max-w-[180px]">
                      {widgetGreetingText}
                    </div>
                  )}
                  <div className="flex items-center gap-2 justify-end">
                    {widgetButtonLabel && (
                      <span className="text-white text-xs font-semibold px-3 py-2 rounded-full" style={{ background: widgetPrimaryColor }}>
                        {widgetButtonLabel}
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ background: widgetPrimaryColor }}>
                      <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Embed Code Section */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Add Widget to Your Website</h3>
              <div className="space-y-3 mb-4">
                {[
                  { n: 1, text: <>Copy the code snippet below.</> },
                  { n: 2, text: <>Open your website&apos;s HTML and paste it just <strong>before the closing <code className="bg-gray-100 px-1 rounded text-xs">&lt;/body&gt;</code> tag</strong> on every page where you want the chat to appear.</> },
                  { n: 3, text: <>Save and publish your site. <strong>The widget appears immediately.</strong> Any changes you make here update automatically — no need to re-paste the code.</> },
                ].map(({ n, text }) => (
                  <div key={n} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</div>
                    <p className="text-sm text-gray-600">{text}</p>
                  </div>
                ))}
              </div>
              <EmbedCodeBlock businessId={business.id ?? ''} />
              <p className="text-xs text-gray-400 mt-2">Using WordPress, Wix, or Squarespace? <a href="/faq" className="text-blue-600 hover:underline">See our FAQ →</a></p>
            </div>
          </div>
        )}

        {/* ACCOUNT TAB */}
        <div className={activeTab === "account" ? "block" : "hidden"}>
          <div className="mb-8 border-b border-gray-100 pb-5">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Account</h2>
            <p className="text-gray-500 text-sm mt-1">Manage your subscription and account settings.</p>
          </div>

          <div className="space-y-6 max-w-2xl">
            {/* Billing section */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 bg-white">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Subscription</h3>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-gray-900 tracking-tight">
                          {PLAN_LABELS[business.plan] ?? business.plan}
                        </span>
                        {business.billing_cycle && (
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                            {business.billing_cycle}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          business.plan_status === "active" || business.plan_status === "trialing"
                            ? "bg-green-500"
                            : business.plan_status === "canceled"
                            ? "bg-red-500"
                            : business.plan_status === "past_due"
                            ? "bg-orange-500"
                            : "bg-gray-400"
                        }`} />
                        <span className={`text-xs font-medium ${
                          business.plan_status === "active" || business.plan_status === "trialing"
                            ? "text-gray-700"
                            : business.plan_status === "canceled"
                            ? "text-red-600"
                            : business.plan_status === "past_due"
                            ? "text-orange-600"
                            : "text-gray-500"
                        } capitalize`}>
                          {business.plan_status === "trialing" ? "Free trial" : business.plan_status ?? "Free"}
                        </span>
                        {business.current_period_end && business.plan_status !== "canceled" && (
                          <span className="text-xs text-gray-400">
                            · renews {new Date(business.current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {business.stripe_customer_id ? (
                    <button
                      type="button"
                      onClick={handleOpenPortal}
                      disabled={portalLoading}
                      className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
                    >
                      {portalLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ExternalLink size={15} />
                      )}
                      Manage Subscription
                    </button>
                  ) : (
                    <a
                      href="/pricing"
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    >
                      Upgrade Plan
                    </a>
                  )}
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Billing is managed through Stripe. Click &quot;Manage Subscription&quot; to update your payment method, download invoices, or cancel your plan.
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-orange-200 bg-orange-50/30 overflow-hidden">
              <div className="px-6 py-4 border-b border-orange-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <h3 className="text-sm font-black text-orange-700 uppercase tracking-wider">Danger Zone</h3>
              </div>

              <div className="px-6 py-5">
                {deleteStep === "idle" && (
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Delete this account</p>
                      <p className="text-xs text-gray-500 max-w-sm">
                        Permanently deletes all settings, conversations, and your subscription. This action cannot be undone.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteStep("confirm")}
                      className="flex items-center gap-2 bg-white border border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0"
                    >
                      <Trash2 size={15} />
                      Delete Account
                    </button>
                  </div>
                )}

                {deleteStep === "confirm" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Are you sure?</p>
                      <p className="text-xs text-gray-500 mb-3">
                        This will delete all data for <strong>{business.name}</strong>, cancel your subscription, and permanently remove your account. A confirmation email will be sent to your address.
                      </p>
                      <p className="text-xs font-bold text-gray-700 mb-1.5">
                        Type <span className="font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">DELETE</span> to confirm
                      </p>
                      <input
                        type="text"
                        value={deleteInput}
                        onChange={e => setDeleteInput(e.target.value)}
                        placeholder="DELETE"
                        className="w-full border border-orange-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 bg-white font-mono tracking-wider"
                        autoComplete="off"
                      />
                    </div>
                    {deleteError && (
                      <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{deleteError}</p>
                    )}
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleRequestDeletion}
                        disabled={deleteInput !== "DELETE" || deleteLoading}
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
                      >
                        {deleteLoading ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        Send Confirmation Email
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDeleteStep("idle"); setDeleteInput(""); setDeleteError(""); }}
                        className="w-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {deleteStep === "email_sent" && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Check your email</p>
                      <p className="text-xs text-gray-500">
                        We sent a confirmation link to your email address. Click it to permanently delete your account. The link expires in 24 hours.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setDeleteStep("idle"); setDeleteInput(""); setDeleteError(""); }}
                        className="text-xs text-orange-500 hover:text-orange-600 font-semibold mt-2 underline underline-offset-2"
                      >
                        Cancel deletion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer — hidden on Account tab */}
        <div className={`mt-8 pt-6 border-t border-gray-100 flex items-center justify-between ${activeTab === "account" ? "hidden" : ""}`}>
          <div>
             {error && <span className="text-sm text-red-500 font-medium bg-red-50 px-3 py-1 rounded-lg">{error}</span>}
             {saved && <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-lg">All changes saved!</span>}
          </div>
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-sm shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50">
            {saving ? "Saving..." : <><Save size={18} /> Save Settings</>}
          </button>
        </div>

      </div>
    </form>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50/50 hover:bg-white";

const WAVEFORM_HEIGHTS = [6, 16, 28, 38, 40, 34, 22, 38, 40, 28, 14, 32, 40, 24, 38, 12, 30, 40, 22, 36, 16, 40, 28, 14, 36, 40, 20, 10];
const WAVEFORM_DURATIONS = [0.7, 0.55, 0.9, 0.6, 0.75, 0.5, 1.0, 0.65, 0.8, 0.55, 0.7, 0.9, 0.5, 0.75, 0.6, 0.85, 0.5, 0.7, 0.95, 0.6, 0.8, 0.5, 0.7, 0.9, 0.55, 0.75, 0.6, 0.85];

function VoiceWaveform({ name }: { name: string }) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-2">
      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{name} · Previewing</span>
      <div className="flex items-end gap-[2.5px] h-10">
        {WAVEFORM_HEIGHTS.map((maxH, i) => (
          <div
            key={i}
            className="flex-1 rounded-full animate-waveform"
            style={{
              background: `linear-gradient(to top, #2563eb, #60a5fa)`,
              minWidth: '3px',
              maxWidth: '8px',
              ['--wave-min' as string]: '3px',
              ['--wave-max' as string]: `${maxH}px`,
              animationDuration: `${WAVEFORM_DURATIONS[i]}s`,
              animationDelay: `${(i * 0.055) % 0.7}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function EmbedCodeBlock({ businessId }: { businessId: string }) {
  const [copied, setCopied] = useState(false);
  const code = `<script src="https://app.getsalvaai.com/api/widget/embed?id=${businessId}"></script>`;
  return (
    <div className="relative bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-sm text-blue-700 overflow-x-auto">
      {code}
      <button
        type="button"
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute top-3 right-3 text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 font-semibold hover:bg-gray-50 transition-colors text-gray-600"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function Field({ label, required, hint, fixedHintHeight, children }: { label: string; required?: boolean; hint?: string; fixedHintHeight?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full justify-end">
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      {hint && <p className="text-[11px] text-gray-500 mb-2 font-medium">{hint}</p>}
      {!hint && fixedHintHeight && <div className="h-[20px] w-full" />}
      {children}
    </div>
  );
}
