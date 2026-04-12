"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HoursPicker, { type WeeklyHours, parseHours } from "@/components/HoursPicker";

type FAQ = { question: string; answer: string };
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
};

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

        <Field label="Custom instructions" hint="Extra guidance for the AI (optional)">
          <textarea
            rows={4}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder="Always mention our free new patient exam offer..."
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
              <a href="/pricing" className="text-blue-600 hover:underline font-medium">Pro plan ($189/mo)</a>.
              {" "}Upgrade to answer calls automatically, 24/7.
            </p>
          </div>
        )}
      </section>

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
