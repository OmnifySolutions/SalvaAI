"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Plus, User, Bot, PhoneCall, Zap, Save, AlertCircle } from "lucide-react";
import HoursPicker, { type WeeklyHours, parseHours } from "@/components/HoursPicker";

// Types remain same
type FAQ = { question: string; answer: string };
type VoiceTone = "professional" | "warm" | "clinical";

type Business = {
  name: string;
  business_type: string;
  hours: unknown;
  services: unknown;
  ai_name: string;
  ai_greeting: string | null;
  custom_prompt: string | null;
  faqs: FAQ[];
  plan: string;
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
};

// Presets remain same
const TONES: { key: VoiceTone; label: string; subtitle: string }[] = [
  { key: "professional", label: "Professional & Efficient", subtitle: "Busy front desk. Direct, no filler." },
  { key: "warm",         label: "Warm & Friendly",          subtitle: "Approachable. Great for pediatrics." },
  { key: "clinical",     label: "Clinical & Precise",        subtitle: "Minimal small talk. Ideal for surgeons." },
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
  { id: "profile", label: "Practice Profile", icon: User },
  { id: "ai", label: "AI Configuration", icon: Bot },
  { id: "voice", label: "Voice Settings", icon: PhoneCall },
  { id: "integrations", label: "Integrations", icon: Zap },
];

export default function SettingsForm({ business }: { business: Business }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(business.name);
  const [businessType, setBusinessType] = useState(business.business_type);
  const [hours, setHours] = useState<WeeklyHours>(() => parseHours(business.hours));
  const [services, setServices] = useState(typeof business.services === "string" ? business.services : Array.isArray(business.services) ? business.services.map((s: { name: string }) => s.name).join(", ") : "");
  
  const [aiName, setAiName] = useState(business.ai_name ?? "Claire");
  const [aiGreeting, setAiGreeting] = useState(business.ai_greeting ?? "");
  const [customPrompt, setCustomPrompt] = useState(business.custom_prompt ?? "");
  const [faqs, setFaqs] = useState<FAQ[]>(business.faqs ?? []);
  
  const [voiceEnabled, setVoiceEnabled] = useState(business.voice_enabled ?? false);
  const [voiceTone, setVoiceTone] = useState<VoiceTone>(business.voice_tone ?? "professional");
  const [voiceEmergencyNumber, setVoiceEmergencyNumber] = useState(business.voice_emergency_number ?? "");
  const [voiceEmergencyMessage, setVoiceEmergencyMessage] = useState(business.voice_emergency_message ?? "");
  const [voiceDeflectTopics, setVoiceDeflectTopics] = useState<string[]>(business.voice_deflect_topics ?? []);
  const [voiceScenarios, setVoiceScenarios] = useState<string[]>(business.voice_scenarios ?? []);
  
  const [odServerUrl, setOdServerUrl] = useState(business.opendental_server_url ?? "");
  const [odApiKey, setOdApiKey] = useState(business.opendental_api_key ?? "");
  const [odTestStatus, setOdTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const isOdConnected = !!business.opendental_api_key;

  const hasVoice = business.plan === "pro" || business.plan === "multi";

  function addFaq() { setFaqs((f) => [...f, { question: "", answer: "" }]); }
  function updateFaq(i: number, field: "question" | "answer", value: string) {
    setFaqs((f) => f.map((faq, idx) => (idx === i ? { ...faq, [field]: value } : faq)));
  }
  function removeFaq(i: number) { setFaqs((f) => f.filter((_, idx) => idx !== i)); }

  function toggleDeflect(key: string) {
    setVoiceDeflectTopics((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }
  function toggleScenario(key: string) {
    setVoiceScenarios((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }

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
          name, businessType, hours, services, aiName, aiGreeting, customPrompt,
          faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
          voiceEnabled, voiceTone, voiceEmergencyNumber: voiceEmergencyNumber || null, voiceEmergencyMessage: voiceEmergencyMessage || null,
          voiceDeflectTopics, voiceScenarios, openDentalServerUrl: odServerUrl || null, openDentalApiKey: odApiKey || null,
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
      <div className="w-full md:w-64 bg-gray-50/50 p-6 border-r border-gray-200 hidden md:block">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Settings</h3>
        <ul className="space-y-2">
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 bg-white">
        
        {/* PROFILE TAB */}
        <div className={activeTab === "profile" ? "block" : "hidden"}>
          <div className="mb-8 border-b border-gray-100 pb-5">
            <h2 className="text-2xl font-bold text-gray-900">Practice Profile</h2>
            <p className="text-gray-500 text-sm mt-1">General information about your office.</p>
          </div>
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-6">
              <Field label="Practice name">
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Specialty">
                <select value={businessType} onChange={e => setBusinessType(e.target.value)} className={inputCls}>
                  <option value="dental">General Dental</option>
                  <option value="orthodontics">Orthodontics</option>
                  <option value="oral_surgery">Oral Surgery</option>
                </select>
              </Field>
            </div>
            <Field label="Services Offered" hint="Comma-separated primary treatments">
              <textarea rows={2} value={services} onChange={e => setServices(e.target.value)} className={inputCls} />
            </Field>
            <div className="pt-4">
              <Field label="Business Hours"><HoursPicker value={hours} onChange={setHours} /></Field>
            </div>
          </div>
        </div>

        {/* AI CONFIG TAB */}
        <div className={activeTab === "ai" ? "block" : "hidden"}>
          <div className="mb-8 border-b border-gray-100 pb-5">
            <h2 className="text-2xl font-bold text-gray-900">AI Personality</h2>
            <p className="text-gray-500 text-sm mt-1">Define how your agent responds and answers FAQs.</p>
          </div>
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-6">
               <Field label="Agent Name"><input type="text" value={aiName} onChange={e => setAiName(e.target.value)} className={inputCls} /></Field>
               <Field label="Custom Greeting (Optional)"><input type="text" value={aiGreeting} onChange={e => setAiGreeting(e.target.value)} className={inputCls} placeholder="Hi, thanks for calling..." /></Field>
            </div>
            <Field label="System Prompt" hint="Direct operating instructions for the LLM">
              <textarea rows={4} value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} className={inputCls} placeholder="Always offer the new patient special..." />
            </Field>

            <div className="pt-6 mt-6 border-t border-gray-100">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-semibold text-gray-900">Patient FAQs</h3>
                 <button type="button" onClick={addFaq} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold">+ Rule</button>
               </div>
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
              <h2 className="text-2xl font-bold text-gray-900">Voice Calling</h2>
              <p className="text-gray-500 text-sm mt-1">Configure your telephony and routing.</p>
            </div>
            {hasVoice && (
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm font-medium text-gray-700">Accept Calls</span>
                <div className={`relative w-12 h-6 rounded-full transition-colors ${voiceEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <input type="checkbox" className="sr-only" checked={voiceEnabled} onChange={() => setVoiceEnabled(!voiceEnabled)} />
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${voiceEnabled ? 'left-7' : 'left-1'}`} />
                </div>
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
                <h3 className="font-semibold text-gray-900 mb-3">Acoustic Tone</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TONES.map(t => (
                    <div key={t.key} onClick={() => setVoiceTone(t.key)} className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${voiceTone === t.key ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                       <p className={`font-bold text-sm ${voiceTone === t.key ? 'text-blue-800' : 'text-gray-900'}`}>{t.label}</p>
                       <p className="text-xs text-gray-500 mt-1">{t.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                 <h3 className="font-semibold text-gray-900 mb-4">Smart Handoffs (Deflection)</h3>
                 <div className="space-y-3">
                   {DEFLECT_PRESETS.map(p => (
                      <label key={p.key} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100">
                         <input type="checkbox" checked={voiceDeflectTopics.includes(p.key)} onChange={() => toggleDeflect(p.key)} className="w-4 h-4 text-blue-600 rounded" />
                         <span className="text-sm font-medium text-gray-800">{p.label} - <span className="text-gray-500 font-normal">Transfers to desk instead of answering</span></span>
                      </label>
                   ))}
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* INTEGRATIONS TAB */}
        <div className={activeTab === "integrations" ? "block" : "hidden"}>
          <div className="mb-8 border-b border-gray-100 pb-5 flex justify-between items-end">
             <div>
               <h2 className="text-2xl font-bold text-gray-900">App Integrations</h2>
               <p className="text-gray-500 text-sm mt-1">Connect your existing tools to Salva AI.</p>
             </div>
          </div>
          
          <div className={`p-6 rounded-2xl border-2 ${isOdConnected ? 'border-green-500 bg-green-50/30' : 'border-gray-200 bg-white shadow-sm'}`}>
            <div className="flex justify-between items-center mb-6">
               <div className="flexItems-center space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">Open Dental</span>
                    {isOdConnected && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase uppercase tracking-wider">Connected</span>}
                  </div>
                  <p className="text-sm text-gray-500">Live scheduling and patient record sync</p>
               </div>
               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xs uppercase">PMS</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-4 shadow-sm">
               <Field label="Server Endpoint URL"><input type="url" value={odServerUrl} onChange={e => setOdServerUrl(e.target.value)} className={inputCls} placeholder="https://api.opendental.com" /></Field>
               <Field label="Developer API Key">
                 <div className="flex gap-2">
                   <input type="password" value={odApiKey} onChange={e => setOdApiKey(e.target.value)} className={inputCls} placeholder="sk_live_..." />
                   <button type="button" onClick={handleTestConnection} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shrink-0">Test Sync</button>
                 </div>
               </Field>
               {odTestStatus === "ok" && <p className="text-xs text-green-600 font-bold bg-green-50 p-2 rounded flex items-center gap-2"><Check size={14}/> Valid connection established</p>}
               {odTestStatus === "error" && <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded flex items-center gap-2"><AlertCircle size={14}/> Invalid credentials</p>}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
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

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      {hint && <p className="text-[11px] text-gray-500 mb-2 font-medium">{hint}</p>}
      {children}
    </div>
  );
}
