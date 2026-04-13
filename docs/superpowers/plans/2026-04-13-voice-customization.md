# Voice Customization Settings — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Voice Customization" card to `/settings` that lets Pro/Multi practices configure tone, emergency handling, deflection topics, and scenario guidance — all wired into the live AI system prompt at call time.

**Architecture:** New columns are added to `businesses` via a manual Supabase migration. The settings form POSTs the new fields to `/api/settings`, which persists them. `buildSystemPrompt()` in `railway/server.js` reads the new fields and injects them into the LLM system prompt in priority order (deflection before scenarios).

**Tech Stack:** Next.js App Router, TypeScript, Tailwind v4, Supabase (supabaseAdmin), Lucide icons, Railway Node.js server (plain JS)

---

## File Map

| File | What changes |
|---|---|
| `docs/SCHEMA.sql` | Add 5 new voice columns |
| `app/api/settings/route.ts` | Accept + persist 5 new fields |
| `components/SettingsForm.tsx` | New Voice Customization card below Voice AI card |
| `railway/server.js` | Replace hardcoded tone/emergency/deflect/scenario in `buildSystemPrompt()` |

No new files. DB migration is run manually in Supabase SQL Editor.

---

## Task 1: DB Migration + Schema Doc

**Files:**
- Modify: `docs/SCHEMA.sql` (add 5 columns to businesses table definition)

- [ ] **Step 1: Run migration in Supabase SQL Editor**

Go to your Supabase dashboard → SQL Editor → New query. Paste and run:

```sql
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS voice_tone TEXT DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS voice_emergency_number TEXT,
  ADD COLUMN IF NOT EXISTS voice_emergency_message TEXT,
  ADD COLUMN IF NOT EXISTS voice_deflect_topics JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS voice_scenarios JSONB DEFAULT '[]';
```

Expected: "Success. No rows returned."

- [ ] **Step 2: Update docs/SCHEMA.sql to match**

In `docs/SCHEMA.sql`, find the `-- Voice AI` comment block (currently line 52):

```sql
  -- Voice AI
  voice_enabled BOOLEAN DEFAULT false,
```

Replace it with:

```sql
  -- Voice AI
  voice_enabled BOOLEAN DEFAULT false,
  voice_tone TEXT DEFAULT 'professional',          -- 'professional' | 'warm' | 'clinical'
  voice_emergency_number TEXT,                     -- E.164 or display format, read aloud in emergencies
  voice_emergency_message TEXT,                    -- Custom emergency instruction sentence
  voice_deflect_topics JSONB DEFAULT '[]',         -- Array of topic keys + custom strings
  voice_scenarios JSONB DEFAULT '[]',              -- Array of active scenario keys
```

- [ ] **Step 3: Commit**

```bash
git add docs/SCHEMA.sql
git commit -m "feat: add voice customization columns to schema"
```

---

## Task 2: Update API Route

**Files:**
- Modify: `app/api/settings/route.ts`

- [ ] **Step 1: Replace the full file content**

```ts
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name, businessType, hours, services,
    aiName, aiGreeting, customPrompt, faqs, voiceEnabled,
    voiceTone, voiceEmergencyNumber, voiceEmergencyMessage,
    voiceDeflectTopics, voiceScenarios,
  } = body;

  if (!name?.trim()) return Response.json({ error: "Business name required" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("businesses")
    .update({
      name: name.trim(),
      business_type: businessType,
      hours,
      services,
      ai_name: aiName,
      ai_greeting: aiGreeting,
      custom_prompt: customPrompt,
      faqs: faqs ?? [],
      voice_enabled: voiceEnabled ?? false,
      voice_tone: voiceTone ?? "professional",
      voice_emergency_number: voiceEmergencyNumber ?? null,
      voice_emergency_message: voiceEmergencyMessage ?? null,
      voice_deflect_topics: voiceDeflectTopics ?? [],
      voice_scenarios: voiceScenarios ?? [],
    })
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("Settings update error:", error);
    return Response.json({ error: "Failed to save settings" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/daryllvasconcellos/hustleclaude && npx tsc --noEmit
```

Expected: no errors related to `route.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/api/settings/route.ts
git commit -m "feat: persist voice customization fields in settings API"
```

---

## Task 3: Voice Customization Card in SettingsForm

**Files:**
- Modify: `components/SettingsForm.tsx`

This is the largest task. Work through it sub-section by sub-section.

### Step 1: Update the Business type and add imports

- [ ] At the top of `components/SettingsForm.tsx`, replace the import line and `Business` type:

```tsx
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
};
```

### Step 2: Add static config constants

- [ ] Add these constants immediately after the `Business` type (before `export default function`):

```tsx
const TONES: { key: VoiceTone; label: string; subtitle: string }[] = [
  { key: "professional", label: "Professional & Efficient", subtitle: "Busy front desk. Direct, no filler." },
  { key: "warm",         label: "Warm & Friendly",          subtitle: "Approachable. Good for family or pediatric practices." },
  { key: "clinical",     label: "Clinical & Precise",        subtitle: "Minimal small talk. Good for oral surgery or specialists." },
];

const DEFLECT_PRESETS: { key: string; label: string }[] = [
  { key: "appointments",        label: "Appointment requests" },
  { key: "insurance",           label: "Insurance & billing questions" },
  { key: "cost",                label: "Treatment cost estimates" },
  { key: "clinical",            label: "Clinical / medical advice" },
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
```

### Step 3: Add new state variables

- [ ] Inside `export default function SettingsForm`, after the existing `const [voiceEnabled, setVoiceEnabled] = useState(...)` line, add:

```tsx
  const [voiceTone, setVoiceTone] = useState<VoiceTone>(business.voice_tone ?? "professional");
  const [voiceEmergencyNumber, setVoiceEmergencyNumber] = useState(business.voice_emergency_number ?? "");
  const [voiceEmergencyMessage, setVoiceEmergencyMessage] = useState(business.voice_emergency_message ?? "");
  const [voiceDeflectTopics, setVoiceDeflectTopics] = useState<string[]>(business.voice_deflect_topics ?? []);
  const [voiceScenarios, setVoiceScenarios] = useState<string[]>(business.voice_scenarios ?? []);
  const [customDeflectInput, setCustomDeflectInput] = useState("");
  const [showCustomDeflectInput, setShowCustomDeflectInput] = useState(false);
```

### Step 4: Add helper functions

- [ ] After the existing `removeFaq` function, add:

```tsx
  function toggleDeflect(key: string) {
    setVoiceDeflectTopics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function addCustomDeflect() {
    const val = customDeflectInput.trim();
    if (val && !voiceDeflectTopics.includes(val)) {
      setVoiceDeflectTopics((prev) => [...prev, val]);
    }
    setCustomDeflectInput("");
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
```

### Step 5: Wire new fields into handleSubmit

- [ ] In `handleSubmit`, find the `JSON.stringify({ ... })` call and add the 5 new fields:

```tsx
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
        }),
```

### Step 6: Update the custom instructions field

- [ ] In the existing AI Configuration section, find the `Field label="Custom instructions"` block and replace it:

```tsx
        <Field label="Additional instructions" hint='Give the AI extra rules or promotions. Write naturally — one instruction per line works well.'>
          <textarea
            rows={4}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder={`Always mention our free new patient exam for first-time callers.\nIf someone asks about whitening, mention our current promotion.\nNever quote prices — tell them billing will follow up.`}
          />
        </Field>
```

### Step 7: Add the Voice Customization card

- [ ] In the JSX `return`, find the closing `</section>` of the Voice AI section and insert the new card immediately after it (before `{error && ...}`):

```tsx
      {/* Voice Customization — Pro/Multi only */}
      {hasVoice && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-gray-800">Voice Customization</h2>
            <p className="text-xs text-gray-400 mt-0.5">Personalise how your AI receptionist sounds and behaves.</p>
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
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={customDeflectInput}
                    onChange={(e) => setCustomDeflectInput(e.target.value)}
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
```

### Step 8: Type-check

- [ ] Run TypeScript compiler:

```bash
cd /Users/daryllvasconcellos/hustleclaude && npx tsc --noEmit
```

Expected: no errors in `SettingsForm.tsx`.

### Step 9: Manual browser test

- [ ] Start the dev server: `npm run dev`
- [ ] Go to `http://localhost:3000/settings` as a Pro/Multi user
- [ ] Verify the Voice Customization card appears below the Voice AI card
- [ ] Click each tone pill — verify blue selection state activates correctly, only one pill active at a time
- [ ] Fill in an emergency number and message
- [ ] Check several deflection boxes — verify blue checkbox fills in
- [ ] Click "+ Add your own topic", type a topic, press Enter — verify it appears as a pill with an X
- [ ] Click X on the custom topic — verify it disappears
- [ ] Toggle several scenario switches — verify blue toggle slides
- [ ] Click "Save settings" — verify "Settings saved." appears
- [ ] Reload the page — verify all selections are restored from the database

### Step 10: Commit

```bash
git add components/SettingsForm.tsx
git commit -m "feat: add Voice Customization settings card (tone, emergency, deflect, scenarios)"
```

---

## Task 4: Update buildSystemPrompt() in Railway Server

**Files:**
- Modify: `railway/server.js` (function starting at line 102)

- [ ] **Step 1: Replace the entire `buildSystemPrompt` function**

Find the function starting at line 102 and replace it with:

```js
function buildSystemPrompt(business) {
  const hours    = typeof business.hours    === 'string' ? safeParse(business.hours)    : (business.hours    || {});
  const services = typeof business.services === 'string' ? safeParse(business.services) : (business.services || []);
  const faqs     = business.faqs || [];

  const hoursText = Object.entries(hours)
    .filter(([, v]) => v?.enabled)
    .map(([day, v]) => `${day}: ${v.open}–${v.close}`)
    .join(', ');

  const servicesText = Array.isArray(services)
    ? services.map((s) => s.name || s).join(', ')
    : String(services || '');

  const faqText = faqs
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join('\n\n');

  // ── Tone ────────────────────────────────────────────────────────────────────
  const toneMap = {
    professional: 'Direct and helpful. Skip the excessive empathy — no filler affirmations. Friendly but not warm. Think busy front desk.',
    warm:         'Warm and approachable. You can show genuine care and take a moment to make callers feel at ease. Still efficient — do not ramble.',
    clinical:     'Precise and efficient. Minimal small talk. Callers expect professionalism, not warmth. Get to the point quickly.',
  };
  const toneText = toneMap[business.voice_tone] || toneMap.professional;

  // ── Emergency ───────────────────────────────────────────────────────────────
  const emergencyText = (business.voice_emergency_number || business.voice_emergency_message)
    ? `Emergency handling: If a caller describes a dental emergency, ${business.voice_emergency_message || 'direct them to seek immediate care.'} ${business.voice_emergency_number ? `Our emergency line is ${business.voice_emergency_number}.` : ''}`
    : `If a caller describes a dental emergency, tell them you will flag it as urgent and have someone call them back immediately.`;

  // ── Deflection (PRIORITY — injected before scenarios) ───────────────────────
  const deflectLabels = {
    appointments:        'appointment requests or scheduling',
    insurance:           'insurance or billing questions',
    cost:                'treatment cost or pricing questions',
    clinical:            'clinical or medical advice',
    prescriptions:       'prescription refill requests',
    doctor_availability: 'questions about specific doctor availability',
  };
  const deflectTopics = (business.voice_deflect_topics || [])
    .map((t) => deflectLabels[t] || t)
    .filter(Boolean);

  const deflectText = deflectTopics.length
    ? `PRIORITY RULE — Deflect the following topics immediately. Do not attempt to handle them yourself. Tell the caller a team member will follow up. This overrides all other instructions:\n- ${deflectTopics.join('\n- ')}`
    : '';

  // ── Scenarios (injected after deflection) ───────────────────────────────────
  const scenarioMap = {
    new_patient:    'If a caller is a new patient or asks about becoming a patient: collect their name and preferred contact method, and tell them the office will be in touch shortly.',
    appointment:    'If a caller wants to book or change an appointment: acknowledge the request, collect their name and preferred time, and tell them the office will confirm.',
    insurance:      'If a caller asks about insurance verification: acknowledge, tell them the billing team handles this, and collect their name and callback number.',
    post_procedure: 'If a caller has a concern after a recent procedure: show care, tell them you are routing this to the clinical team right away, and provide the emergency line if available.',
    after_hours:    'If the caller is reaching out outside office hours: acknowledge the office is currently closed, offer to take a callback request, and provide the emergency line if available.',
  };
  const activeScenarios = (business.voice_scenarios || [])
    .map((s) => scenarioMap[s])
    .filter(Boolean);

  const scenarioText = activeScenarios.length
    ? `Scenario guidance:\n${activeScenarios.join('\n')}`
    : '';

  return `You are ${business.ai_name || 'Claire'}, the AI receptionist for ${business.name}.

You are answering a live phone call. Never use lists, bullet points, or any formatting. Your words will be spoken aloud, so write exactly as you would speak. One or two sentences maximum — longer only when a caller asks something detailed.

Tone: ${toneText}
Use the practice name naturally when it fits — e.g. "here at ${business.name}" or "at ${business.name} we..." — but don't force it into every response.

Practice information:
- Name: ${business.name}
- Hours: ${hoursText || 'See website for current hours'}
- Services: ${servicesText || 'General dental care'}
${business.custom_prompt ? `\nAdditional instructions:\n${business.custom_prompt}` : ''}
${faqText ? `\nFrequently asked questions:\n${faqText}` : ''}

${emergencyText}
${deflectText ? `\n${deflectText}` : ''}
${scenarioText ? `\n${scenarioText}` : ''}

General guidelines:
- If you don't know something, offer to have the office follow up.
- Do not volunteer that you are an AI unless directly asked.`;
}
```

- [ ] **Step 2: Manual voice test — tone**

  - In Supabase, set `voice_tone = 'warm'` for your test business
  - Call via `/voice-test`
  - Verify the AI sounds warmer/more empathetic
  - Reset to `'professional'`

- [ ] **Step 3: Manual voice test — deflection**

  - In Supabase, set `voice_deflect_topics = '["appointments"]'` for your test business
  - Call via `/voice-test`, say "I'd like to book an appointment"
  - Verify AI deflects ("I'll have a team member follow up") instead of collecting appointment details
  - Reset `voice_deflect_topics = '[]'`

- [ ] **Step 4: Commit and deploy Railway**

```bash
git add railway/server.js
git commit -m "feat: wire voice customization fields into buildSystemPrompt"
```

Then in Railway dashboard: the push to `master` will trigger an automatic redeploy. Verify the deploy completes without errors in Railway logs.

---

## Final Check

- [ ] Go to `/settings`, set tone to "Warm & Friendly", add emergency number, check 2 deflection topics, enable 2 scenarios, save
- [ ] Call via `/voice-test`, say "I'd like to schedule an appointment" (which is deflected) — verify AI deflects
- [ ] Say "I'm a new patient looking to join" (scenario: new_patient) — verify AI collects name + contact
- [ ] Verify AI tone feels warmer throughout
- [ ] Go back to settings, verify all saved values are pre-populated correctly on reload
