# Voice Customization Settings — Design Spec
**Date:** 2026-04-13  
**Status:** Approved  
**Scope:** Add a "Voice Customization" card to `/settings`, visible to Pro/Multi users only, with tone presets, emergency handling, deflection topics, scenario toggles, and improved custom instructions.

---

## 1. Overview

The current voice AI system prompt is hardcoded in `railway/server.js` → `buildSystemPrompt()`. Every practice sounds identical regardless of their specialty or preferences. This feature exposes configurable controls in the settings UI and wires them into the system prompt at call time.

---

## 2. Database Migration

New columns on the `businesses` table. Run in Supabase SQL Editor:

```sql
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS voice_tone TEXT DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS voice_emergency_number TEXT,
  ADD COLUMN IF NOT EXISTS voice_emergency_message TEXT,
  ADD COLUMN IF NOT EXISTS voice_deflect_topics JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS voice_scenarios JSONB DEFAULT '[]';
```

| Column | Type | Default | Description |
|---|---|---|---|
| `voice_tone` | `TEXT` | `'professional'` | One of: `professional`, `warm`, `clinical` |
| `voice_emergency_number` | `TEXT` | `null` | Phone number AI reads out for emergencies |
| `voice_emergency_message` | `TEXT` | `null` | Custom emergency instruction sentence |
| `voice_deflect_topics` | `JSONB` | `[]` | Array of deflection topic keys + any custom strings |
| `voice_scenarios` | `JSONB` | `[]` | Array of active scenario keys |

---

## 3. UI — Voice Customization Card

### Placement
A new `<section>` card in `SettingsForm.tsx`, inserted directly below the existing "Voice AI" card. Gated behind `hasVoice` (Pro/Multi plans only). Hidden entirely for Free/Basic users.

### Card structure
`bg-white rounded-xl border border-gray-200 p-6 space-y-6`

Each sub-section is separated by `border-t border-gray-100 pt-6`.

---

### 3a. Tone Preset

Three pill buttons in a row. One selectable at a time.

**States:**
- Default: `border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 hover:border-gray-300`
- Selected: `border border-blue-600 bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-600 font-medium`

**Options:**

| Key | Label | Subtitle |
|---|---|---|
| `professional` | Professional & Efficient | Busy front desk. Direct, no filler. |
| `warm` | Warm & Friendly | Approachable. Good for family or pediatric practices. |
| `clinical` | Clinical & Precise | Minimal small talk. Good for oral surgery or specialists. |

---

### 3b. Emergency Handling

Two fields side by side (stacked on mobile):

1. **Emergency phone number** — `<input type="tel">`, placeholder: `+1 (555) 999-0000`
2. **Custom message** — `<input type="text">`, placeholder: `For dental emergencies after hours, please call our emergency line immediately.`

Helper text below: `"The AI will read this number and message when a caller describes a dental emergency."`

---

### 3c. Deflection Topics

**Primary: Preset checklist**

Custom checkbox component. Unchecked: `border border-gray-200 rounded w-4 h-4`. Checked: `bg-blue-600 border-blue-600` with a white Lucide `Check` icon (`size={12}`).

Preset topics (stored as string keys in `voice_deflect_topics` array):

| Key | Label |
|---|---|
| `appointments` | Appointment requests |
| `insurance` | Insurance & billing questions |
| `cost` | Treatment cost estimates |
| `clinical` | Clinical / medical advice |
| `prescriptions` | Prescription refill requests |
| `doctor_availability` | Specific doctor availability |

**Secondary: Custom topics**

Below the checklist, a small `+ Add your own topic` button (`text-sm text-blue-600`). Clicking it reveals an input. Each custom topic added appears as a pill with an `X` remove button. Stored as plain strings in the same `voice_deflect_topics` array.

---

### 3d. Scenario Toggles

Five pre-built scenarios. Each row: label + description on the left, a `bg-blue-600` sliding toggle (same component as voice enable toggle) on the right.

| Key | Label | AI behaviour |
|---|---|---|
| `new_patient` | New patient inquiry | Collects name + preferred contact, tells them office will be in touch |
| `appointment` | Appointment scheduling | Acknowledges request, collects name + preferred time, says office will confirm |
| `insurance` | Insurance verification | Acknowledges, routes to billing team, collects callback info |
| `post_procedure` | Post-procedure concern | Shows care, routes to clinical team immediately, offers emergency line if applicable |
| `after_hours` | After-hours call | Acknowledges office is closed, offers callback or emergency line |

**Deflection priority note:** Displayed as a small helper line above the toggles:
> `"If a topic appears in both Deflection and Scenarios, deflection always takes priority."`

---

### 3e. Custom Instructions (improved)

Existing `custom_prompt` field, restyled:

- **Label:** `Additional instructions (optional)`
- **Helper text above field:** `"Give the AI extra rules or promotions. Write naturally — one instruction per line works well."`
- **Placeholder (multiline):**
```
Always mention our free new patient exam for first-time callers.
If someone asks about whitening, mention our current promotion.
Never quote prices — tell them billing will follow up.
```

---

## 4. API — `/api/settings` Route

Add new fields to the POST body and Supabase update:

```ts
const { 
  // existing fields...
  voiceTone, voiceEmergencyNumber, voiceEmergencyMessage,
  voiceDeflectTopics, voiceScenarios
} = body;

// In supabaseAdmin.update():
voice_tone: voiceTone ?? 'professional',
voice_emergency_number: voiceEmergencyNumber ?? null,
voice_emergency_message: voiceEmergencyMessage ?? null,
voice_deflect_topics: voiceDeflectTopics ?? [],
voice_scenarios: voiceScenarios ?? [],
```

---

## 5. System Prompt — `buildSystemPrompt()` in Railway

Update `railway/server.js` to read the new fields. Injection order matters — deflection rules are injected **before** scenario instructions so they always take priority.

### Tone injection
Replace hardcoded tone block with a lookup:

```js
const toneMap = {
  professional: 'Direct and helpful. Skip the excessive empathy — no filler affirmations. Friendly but not warm. Think busy front desk.',
  warm: 'Warm and approachable. You can show genuine care and take a moment to make callers feel at ease. Still efficient — do not ramble.',
  clinical: 'Precise and efficient. Minimal small talk. Callers expect professionalism, not warmth. Get to the point quickly.',
};
const toneText = toneMap[business.voice_tone] || toneMap.professional;
```

### Emergency injection
```js
const emergencyText = (business.voice_emergency_number || business.voice_emergency_message)
  ? `Emergency handling: If a caller describes a dental emergency, ${business.voice_emergency_message || 'direct them to seek immediate care.'} ${business.voice_emergency_number ? `Our emergency line is ${business.voice_emergency_number}.` : ''}`
  : `If a caller describes a dental emergency, tell them you will flag it as urgent and have someone call them back immediately.`;
```

### Deflection injection (runs before scenarios)
```js
const deflectLabels = {
  appointments: 'appointment requests or scheduling',
  insurance: 'insurance or billing questions',
  cost: 'treatment cost or pricing questions',
  clinical: 'clinical or medical advice',
  prescriptions: 'prescription refill requests',
  doctor_availability: 'questions about specific doctor availability',
};
const topics = (business.voice_deflect_topics || [])
  .map(t => deflectLabels[t] || t)
  .filter(Boolean);

const deflectText = topics.length
  ? `PRIORITY RULE — Deflect the following topics immediately. Do not attempt to handle them. Tell the caller a team member will follow up. This overrides all other instructions:\n- ${topics.join('\n- ')}`
  : '';
```

### Scenario injection (runs after deflection)
```js
const scenarioMap = {
  new_patient: 'If a caller is a new patient or asks about becoming a patient: collect their name and preferred contact method, and tell them the office will be in touch shortly.',
  appointment: 'If a caller wants to book or change an appointment: acknowledge the request, collect their name and preferred time, and tell them the office will confirm.',
  insurance: 'If a caller asks about insurance verification: acknowledge, tell them the billing team handles this, and collect their name and callback number.',
  post_procedure: 'If a caller has a concern after a recent procedure: show care, tell them you are routing this to the clinical team right away, and provide the emergency line if available.',
  after_hours: 'If the caller is reaching out outside office hours: acknowledge the office is currently closed, offer to take a callback request, and provide the emergency line if available.',
};
const activeScenarios = (business.voice_scenarios || [])
  .map(s => scenarioMap[s])
  .filter(Boolean);

const scenarioText = activeScenarios.length
  ? `Scenario guidance:\n${activeScenarios.join('\n')}`
  : '';
```

---

## 6. Files Changed

| File | Change |
|---|---|
| `docs/SCHEMA.sql` | Add 5 new voice columns |
| `components/SettingsForm.tsx` | New Voice Customization card with 5 sub-sections |
| `app/api/settings/route.ts` | Accept + persist 5 new fields |
| `railway/server.js` | Update `buildSystemPrompt()` to use new fields |

**No new files needed.** Migration SQL is run manually in Supabase dashboard.

---

## 7. Out of Scope

- Voice A/B testing
- Per-scenario custom scripts
- Call transcript review tied to scenario outcomes
- Mobile-specific UI variants
