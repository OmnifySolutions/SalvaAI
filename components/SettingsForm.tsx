"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Plus } from "lucide-react";
import HoursPicker, { type WeeklyHours, parseHours } from "@/components/HoursPicker";

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

const TONES: { key: VoiceTone; label: string; subtitle: string }[] = [
  { key: "professional", label: "Professional & Efficient", subtitle: "Busy front desk. Direct, no filler." },
  { key: "warm",         label: "Warm & Friendly",          subtitle: "Approachable. Good for family or pediatric practices." },
  { key: "clinical",     label: "Clinical & Precise",        subtitle: "Minimal small talk. Good for oral surgery or specialists." },
];

const DEFLECT_PRESETS: { key: string; label: string }[] = [
  { key: "appointments",        label: "Appointment requests" },
  { key: "insurance",           label: "Insurance & billing questions" },
  { key: "cost",                label: "Treatment cost estimates" },
  { key: "clinical_advice",      label: "Clinical / medical advice" },
  { key: "prescriptions",       label: "Prescription refill requests" },
  { key: "doctor_availability", label: "Specific doctor availability" },
];

const PRESET_KEYS = new Set(DEFLECT_PRESETS.map((p) => p.key));

const SCENARIOS: { key: string; label: string; description: string }[] = [
  { key: "new_patient",    label: "New patient inquiry",     description: "Collect name + contact, tell them office will be in touch." },
  { key: "appointment",    label: "Appointment scheduling",  description: "Acknowledge, collect name + preferred time, say office will confirm." },
  { key: "insurance",      label: "Insurance verification",  description: "Route to billing team, collect callback info." },
  { key: "post_procedure", label: "Post-procedure concern",  description: "Show care, route to clinical team immediately." },
  { key: "after_hours",    label: "After-hours call",        description: "Acknowledge office closed, offer callback or emergency line." },
];

export default function SettingsForm({ business }: { business: Business }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(business.name);
  const [businessType, setBusinessType] = useState(business.business_type);
  const [hours, setHours] = useState<WeeklyHours>(() => parseHours(business.hours));
  const [services, setServices] = useState(
    typeof business.services === "string"
      ? business.services
      : Array.isArray(business.services)
        ? business.services.map((s: { name: string }) => s.name).join(", ")
        : ""
  );
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
  const [odBookingMode, setOdBookingMode] = useState<"autonomous" | "pending" | "collect_only">(
    business.opendental_booking_mode ?? "autonomous"
  );
  const [odBookingWindow, setOdBookingWindow] = useState<number>(
    business.opendental_booking_window ?? 7
  );
  const [odTestStatus, setOdTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [odTestMessage, setOdTestMessage] = useState("");
  const isOdConnected = !!business.opendental_api_key;
  const [customDeflectInput, setCustomDeflectInput] = useState("");
  const [showCustomDeflectInput, setShowCustomDeflectInput] = useState(false);
  const [customDeflectError, setCustomDeflectError] = useState("");

  const hasVoice = business.plan === "pro" || business.plan === "multi";

  function addFaq() {
    setFaqs((f) => [...f, { question: "", answer: "" }]);
  }

  function updateFaq(i: number, field: "question" | "answer", value: string) {
    setFaqs((f) => f.map((faq, idx) => (idx === i ? { ...faq, [field]: value } : faq)));
  }

  function removeFaq(i: number) {
    setFaqs((f) => f.filter((_, idx) => idx !== i));
  }

  function toggleDeflect(key: string) {
    setVoiceDeflectTopics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function addCustomDeflect() {
    const val = customDeflectInput.trim();
    if (!val) return;
    if (voiceDeflectTopics.includes(val)) {
      setCustomDeflectError("Already added");
      return;
    }
    setVoiceDeflectTopics((prev) => [...prev, val]);
    setCustomDeflectInput("");
    setCustomDeflectError("");
    setShowCustomDeflectInput(false);
  }

  function removeCustomDeflect(topic: string) {
    setVoiceDeflectTopics((prev) => prev.filter((t) => t !== topic));
  }

  function toggleScenario(key: string) {
    setVoiceScenarios((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleTestConnection() {
    setOdTestStatus("testing");
    setOdTestMessage("");
    try {
      const res = await fetch("/api/settings/opendental-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverUrl: odServerUrl, apiKey: odApiKey }),
      });
      const data = await res.json();
      if (data.ok) {
        setOdTestStatus("ok");
        setOdTestMessage("Connected successfully");
      } else {
        setOdTestStatus("error");
        setOdTestMessage(data.error || "Connection failed");
      }
    } catch {
      setOdTestStatus("error");
      setOdTestMessage("Network error — could not reach server");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          businessType,
          hours,
          services,
          aiName,
          aiGreeting,
          customPrompt,
          faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
          voiceEnabled,
          voiceTone,
          voiceEmergencyNumber: voiceEmergencyNumber || null,
          voiceEmergencyMessage: voiceEmergencyMessage || null,
          voiceDeflectTopics,
          voiceScenarios,
          openDentalServerUrl: odServerUrl || null,
          openDentalApiKey: odApiKey || null,
          openDentalBookingMode: odBookingMode,
          openDentalBookingWindow: odBookingWindow,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Practice info */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Practice Info</h2>

        <Field label="Practice name" required>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Business type">
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className={inputCls}
          >
            <option value="dental">Dental Office</option>
            <option value="orthodontics">Orthodontics</option>
            <option value="oral_surgery">Oral Surgery</option>
            <option value="pediatric_dental">Pediatric Dentistry</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label="Office hours">
          <HoursPicker value={hours} onChange={setHours} />
        </Field>

        <Field label="Services offered" hint="Comma-separated list">
          <textarea
            rows={3}
            value={services}
            onChange={(e) => setServices(e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </Field>
      </section>

      {/* AI configuration */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">AI Configuration</h2>

        <Field label="AI receptionist name" hint="What your AI introduces itself as">
          <input
            type="text"
            value={aiName}
            onChange={(e) => setAiName(e.target.value)}
            className={inputCls}
            placeholder="Claire"
          />
        </Field>

        <Field label="Custom greeting" hint="Leave blank to use the default">
          <input
            type="text"
            value={aiGreeting}
            onChange={(e) => setAiGreeting(e.target.value)}
            className={inputCls}
            placeholder="Hi! I'm here to help answer your questions."
          />
        </Field>

        <Field label="Additional instructions" hint='Give the AI extra rules or promotions. Write naturally — one instruction per line works well.'>
          <textarea
            rows={4}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder={`Always mention our free new patient exam for first-time callers.\nIf someone asks about whitening, mention our current promotion.\nNever quote prices — tell them billing will follow up.`}
          />
        </Field>
      </section>

      {/* FAQs */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">FAQs</h2>
          <button
            type="button"
            onClick={addFaq}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add FAQ
          </button>
        </div>

        {faqs.length === 0 && (
          <p className="text-sm text-gray-400">
            No FAQs yet. Add common questions your patients ask.
          </p>
        )}

        {faqs.map((faq, i) => (
          <div key={i} className="space-y-2 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => updateFaq(i, "question", e.target.value)}
                  className={inputCls}
                />
                <textarea
                  rows={2}
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) => updateFaq(i, "answer", e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <button
                type="button"
                onClick={() => removeFaq(i)}
                className="text-gray-300 hover:text-red-400 mt-1 shrink-0"
                aria-label="Remove FAQ"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Voice AI */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Voice AI</h2>
            <p className="text-xs text-gray-400 mt-0.5">Answer phone calls automatically with AI</p>
          </div>
          {!hasVoice && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
              Pro plan required
            </span>
          )}
        </div>

        {hasVoice ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Enable voice answering</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Forward your practice number to your assigned Twilio number to activate.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVoiceEnabled((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  voiceEnabled ? "bg-blue-600" : "bg-gray-200"
                }`}
                aria-label="Toggle voice AI"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    voiceEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {business.twilio_sid ? (
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 mb-1 font-medium">Your Twilio number</p>
                <p className="text-sm font-mono text-gray-800">{business.twilio_sid}</p>
                <p className="text-xs text-gray-400 mt-1">Forward your practice number to this number to route calls to the AI.</p>
              </div>
            ) : (
              <div className="bg-blue-50 rounded-lg px-4 py-3">
                <p className="text-sm text-blue-700">
                  Your dedicated phone number is being provisioned. Check back shortly or contact support.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-sm text-gray-500">
              Voice AI is available on the{" "}
              <a href="/pricing" className="text-blue-600 hover:underline font-medium">Pro plan ($219/mo)</a>.
              {" "}Upgrade to answer calls automatically, 24/7.
            </p>
          </div>
        )}
      </section>

      {/* Voice Customization — Pro/Multi only */}
      {hasVoice && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-gray-800">Voice Customization</h2>
            <p className="text-xs text-gray-400 mt-0.5">Personalize how your AI receptionist sounds and behaves.</p>
          </div>

          {/* Tone preset */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <label className="block text-sm font-medium text-gray-700">AI tone</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TONES.map((tone) => (
                <button
                  key={tone.key}
                  type="button"
                  onClick={() => setVoiceTone(tone.key)}
                  className={`text-left rounded-lg border px-4 py-3 transition-colors ${
                    voiceTone === tone.key
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className={`text-sm font-medium ${voiceTone === tone.key ? "text-blue-600" : "text-gray-700"}`}>
                    {tone.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{tone.subtitle}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency handling */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Emergency handling</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Emergency phone number">
                <input
                  type="tel"
                  value={voiceEmergencyNumber}
                  onChange={(e) => setVoiceEmergencyNumber(e.target.value)}
                  className={inputCls}
                  placeholder="+1 (555) 999-0000"
                />
              </Field>
              <Field label="Emergency message">
                <input
                  type="text"
                  value={voiceEmergencyMessage}
                  onChange={(e) => setVoiceEmergencyMessage(e.target.value)}
                  className={inputCls}
                  placeholder="For dental emergencies after hours, please call our emergency line immediately."
                />
              </Field>
            </div>
            <p className="text-xs text-gray-400">The AI will read this number and message when a caller describes a dental emergency.</p>
          </div>

          {/* Deflection topics */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Deflection topics</label>
            <p className="text-xs text-gray-400 -mt-1">The AI will immediately redirect these topics to your team instead of answering.</p>
            <div className="space-y-2">
              {DEFLECT_PRESETS.map((preset) => {
                const checked = voiceDeflectTopics.includes(preset.key);
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => toggleDeflect(preset.key)}
                    className="flex items-center gap-3 w-full text-left group"
                  >
                    <span className={`flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors ${
                      checked ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-gray-400"
                    }`}>
                      {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                    </span>
                    <span className="text-sm text-gray-700">{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom deflect topics */}
            <div className="space-y-2 pt-1">
              {voiceDeflectTopics.filter((t) => !PRESET_KEYS.has(t)).map((topic) => (
                <div key={topic} className="flex items-center gap-2">
                  <span className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700">
                    {topic}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCustomDeflect(topic)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${topic}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {showCustomDeflectInput ? (
                <div>
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={customDeflectInput}
                      onChange={(e) => { setCustomDeflectInput(e.target.value); setCustomDeflectError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomDeflect(); } if (e.key === "Escape") setShowCustomDeflectInput(false); }}
                      className={`${inputCls} flex-1`}
                      placeholder="e.g. Questions about payment plans"
                    />
                    <button
                      type="button"
                      onClick={addCustomDeflect}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
                    >
                      Add
                    </button>
                  </div>
                  {customDeflectError && <p className="text-xs text-red-500 mt-1">{customDeflectError}</p>}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomDeflectInput(true)}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus size={14} />
                  Add your own topic
                </button>
              )}
            </div>
          </div>

          {/* Scenario toggles */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Scenario guidance</label>
            <p className="text-xs text-gray-400 -mt-1">
              Turn on pre-built handling for common call types. If a topic also appears in Deflection above, deflection always takes priority.
            </p>
            <div className="space-y-3">
              {SCENARIOS.map((scenario) => {
                const active = voiceScenarios.includes(scenario.key);
                return (
                  <div key={scenario.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{scenario.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{scenario.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleScenario(scenario.key)}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                        active ? "bg-blue-600" : "bg-gray-200"
                      }`}
                      aria-label={`Toggle ${scenario.label}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          active ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Practice Management */}
      <div id="practice-management" className="border border-gray-200 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Practice Management</h2>
            <p className="text-sm text-gray-500 mt-0.5">Connect Open Dental to enable live appointment booking.</p>
          </div>
          {isOdConnected && (
            <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              Connected
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Server URL</label>
            <input
              type="url"
              value={odServerUrl}
              onChange={(e) => setOdServerUrl(e.target.value)}
              placeholder="https://your-practice.opendental.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={odApiKey}
                onChange={(e) => { setOdApiKey(e.target.value); setOdTestStatus("idle"); }}
                placeholder="Your Open Dental customer key"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={!odServerUrl || !odApiKey || odTestStatus === "testing"}
                className="px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                {odTestStatus === "testing" ? "Testing…" : "Test Connection"}
              </button>
            </div>
            {odTestStatus === "ok" && (
              <p className="text-xs text-green-600 mt-1">{odTestMessage}</p>
            )}
            {odTestStatus === "error" && (
              <p className="text-xs text-red-500 mt-1">{odTestMessage}</p>
            )}
          </div>
        </div>

        {(isOdConnected || odTestStatus === "ok") && (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Booking Mode</p>
              {(["autonomous", "pending", "collect_only"] as const).map((mode) => (
                <label key={mode} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="odBookingMode"
                    value={mode}
                    checked={odBookingMode === mode}
                    onChange={() => setOdBookingMode(mode)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-700">
                    {mode === "autonomous" && <><span className="font-medium">Fully autonomous</span> — AI books directly in Open Dental</>}
                    {mode === "pending"    && <><span className="font-medium">Hold for confirmation</span> — AI offers slots, front desk confirms</>}
                    {mode === "collect_only" && <><span className="font-medium">Collect only</span> — AI takes details, team does the booking</>}
                  </span>
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Availability Window</p>
              <div className="flex gap-4">
                {([3, 7, 14] as const).map((days) => (
                  <label key={days} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="odBookingWindow"
                      value={days}
                      checked={odBookingWindow === days}
                      onChange={() => setOdBookingWindow(days)}
                    />
                    <span className="text-sm text-gray-700">Next {days} days</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-green-600">Settings saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}
