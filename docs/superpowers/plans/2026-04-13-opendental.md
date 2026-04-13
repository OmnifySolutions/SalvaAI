# Open Dental PMS Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Open Dental's REST API so the voice AI can check real-time availability and book appointments during live phone calls, with configurable booking modes and graceful fallback when Open Dental is not connected.

**Architecture:** A new `railway/opendental.js` module handles all Open Dental API calls. `server.js` imports it and runs intent detection after each caller utterance; when booking intent is found, it switches to a non-streaming booking prompt that collects patient info, checks availability, and books the appointment. Settings UI and a test-connection API route let practice owners connect and configure their Open Dental instance.

**Tech Stack:** Open Dental REST API v1, Node.js fetch (railway), Next.js App Router API routes, Supabase (supabaseAdmin), TypeScript (Next.js), React (SettingsForm).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `docs/SCHEMA.sql` | Modify | Add 4 new columns (reference only — migration run manually in Supabase) |
| `railway/opendental.js` | Create | Open Dental API client — all 5 functions + OpenDentalError |
| `railway/server.js` | Modify | Import opendental.js; add intent detection, booking state machine, `processTurn` integration |
| `app/api/settings/route.ts` | Modify | Accept + persist 3 new Open Dental fields |
| `app/api/settings/opendental-test/route.ts` | Create | Test-connection endpoint (validates API key without saving) |
| `components/SettingsForm.tsx` | Modify | Add Practice Management card with API key, booking mode, window radios |
| `app/settings/page.tsx` | Modify | Pass 3 new fields from Supabase to SettingsForm |
| `app/dashboard/page.tsx` | Modify | Add nudge card for Pro/Multi plans without Open Dental connected |

---

## Task 1: Database Schema Migration

**Files:**
- Modify: `docs/SCHEMA.sql`
- Manual: Supabase SQL Editor

- [ ] **Step 1: Update SCHEMA.sql**

Add these lines to the `-- Voice AI` block in the `businesses` table, after `voice_scenarios`:

```sql
  -- Open Dental PMS integration
  opendental_server_url    TEXT,                        -- customer's eConnector base URL
  opendental_api_key       TEXT,                        -- customer API key (null = not connected)
  opendental_booking_mode  TEXT DEFAULT 'autonomous',   -- 'autonomous' | 'pending' | 'collect_only'
  opendental_booking_window INT  DEFAULT 7,             -- 3 | 7 | 14 (days to look ahead)
```

Add this line to the `conversations` table, after `appointment_requested`:

```sql
  appointment_id    TEXT,   -- Open Dental appointment ID; null if not booked via PMS
```

- [ ] **Step 2: Run migration in Supabase**

Open the Supabase dashboard → SQL Editor. Run:

```sql
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS opendental_server_url    TEXT,
  ADD COLUMN IF NOT EXISTS opendental_api_key       TEXT,
  ADD COLUMN IF NOT EXISTS opendental_booking_mode  TEXT DEFAULT 'autonomous'
    CHECK (opendental_booking_mode IN ('autonomous', 'pending', 'collect_only')),
  ADD COLUMN IF NOT EXISTS opendental_booking_window INT  DEFAULT 7
    CHECK (opendental_booking_window IN (3, 7, 14));

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS appointment_id TEXT;
```

Expected: "Success. No rows returned."

- [ ] **Step 3: Verify columns exist**

In Supabase SQL Editor run:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'businesses'
  AND column_name IN ('opendental_server_url','opendental_api_key','opendental_booking_mode','opendental_booking_window');
```

Expected: 4 rows returned with correct types and defaults.

- [ ] **Step 4: Commit schema file**

```bash
git add docs/SCHEMA.sql
git commit -m "feat: add Open Dental columns to schema"
```

---

## Task 2: `railway/opendental.js` — Core Client (findPatient + createPatient)

**Files:**
- Create: `railway/opendental.js`

Open Dental REST API v1:
- Auth header: `Authorization: ODFHIR {OPENDENTAL_DEVELOPER_KEY}/{customerKey}`
- Base URL: `{serverUrl}/api/v1`
- Developer key is stored in Railway env as `OPENDENTAL_DEVELOPER_KEY`
- Customer key is `business.opendental_api_key` from Supabase
- Server URL is `business.opendental_server_url` from Supabase

- [ ] **Step 1: Create the file with OpenDentalError and auth helper**

```js
// railway/opendental.js
// Open Dental REST API v1 client.
// All functions throw OpenDentalError on failure — server.js catches by .code.

const DEVELOPER_KEY = process.env.OPENDENTAL_DEVELOPER_KEY;

export class OpenDentalError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'OpenDentalError';
    this.code = code; // 'INVALID_KEY' | 'UNREACHABLE' | 'SLOT_TAKEN' | 'PATIENT_ERROR'
  }
}

function headers(customerKey) {
  return {
    'Authorization': `ODFHIR ${DEVELOPER_KEY}/${customerKey}`,
    'Content-Type': 'application/json',
  };
}

async function odFetch(serverUrl, customerKey, path, options = {}) {
  const url = `${serverUrl.replace(/\/$/, '')}/api/v1${path}`;
  let res;
  try {
    res = await fetch(url, { ...options, headers: { ...headers(customerKey), ...(options.headers || {}) } });
  } catch (e) {
    throw new OpenDentalError('UNREACHABLE', `Open Dental unreachable: ${e.message}`);
  }
  if (res.status === 401 || res.status === 403) {
    throw new OpenDentalError('INVALID_KEY', 'Open Dental rejected the API key');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new OpenDentalError('UNREACHABLE', `Open Dental ${res.status}: ${body}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
```

- [ ] **Step 2: Add findPatient**

```js
// Search for an existing patient by last name + first name + date of birth.
// Returns the patient object { PatNum, LName, FName, Birthdate, HmPhone, ... } or null.
// DOB format expected: 'YYYY-MM-DD'
export async function findPatient(serverUrl, customerKey, { name, phone, dob }) {
  const [firstName, ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ') || '';
  const params = new URLSearchParams({ LName: lastName, FName: firstName });
  if (dob) params.set('Birthdate', dob);
  try {
    const patients = await odFetch(serverUrl, customerKey, `/patients?${params}`);
    if (!Array.isArray(patients) || patients.length === 0) return null;
    return patients[0];
  } catch (e) {
    if (e instanceof OpenDentalError) throw e;
    throw new OpenDentalError('PATIENT_ERROR', e.message);
  }
}
```

- [ ] **Step 3: Add createPatient**

```js
// Create a new patient record. Returns the new patient object including PatNum.
// dob: 'YYYY-MM-DD', phone: any format (stored as-is)
export async function createPatient(serverUrl, customerKey, { name, phone, dob, email, reason }) {
  const [firstName, ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ') || firstName;
  const body = {
    LName: lastName,
    FName: firstName,
    Birthdate: dob || '',
    HmPhone: phone || '',
    Email: email || '',
    PatStatus: 0,  // 0 = Patient
  };
  try {
    const patient = await odFetch(serverUrl, customerKey, '/patients', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!patient?.PatNum) throw new OpenDentalError('PATIENT_ERROR', 'No PatNum in response');
    return patient;
  } catch (e) {
    if (e instanceof OpenDentalError) throw e;
    throw new OpenDentalError('PATIENT_ERROR', e.message);
  }
}
```

- [ ] **Step 4: Add console verification block (remove before deploy)**

At the bottom of the file temporarily add:

```js
// Temporary: verify module loads without crashing.
// Remove before deploy. Run: node -e "import('./opendental.js')" from railway/
console.log('[opendental] module loaded OK');
```

- [ ] **Step 5: Verify the file loads**

```bash
cd railway && node --input-type=module <<'EOF'
import { findPatient, createPatient, OpenDentalError } from './opendental.js';
console.log('findPatient:', typeof findPatient);
console.log('createPatient:', typeof createPatient);
console.log('OpenDentalError:', typeof OpenDentalError);
EOF
```

Expected output:
```
findPatient: function
createPatient: function
OpenDentalError: function
```

- [ ] **Step 6: Remove the console.log block from step 4**

Delete the "Temporary" block from the bottom of `railway/opendental.js`.

- [ ] **Step 7: Commit**

```bash
git add railway/opendental.js
git commit -m "feat: add opendental.js module — findPatient + createPatient"
```

---

## Task 3: `railway/opendental.js` — getProviders + getAvailability + createAppointment

**Files:**
- Modify: `railway/opendental.js`

- [ ] **Step 1: Add getProviders**

Append to `railway/opendental.js`:

```js
// Return array of { ProvNum, FName, LName, Abbr } for all active providers.
export async function getProviders(serverUrl, customerKey) {
  const providers = await odFetch(serverUrl, customerKey, '/providers');
  return Array.isArray(providers) ? providers : [];
}
```

- [ ] **Step 2: Add getAvailability**

```js
// Return up to 5 open slots within windowDays from today.
// Each slot: { date, time, provider, providerId, operatoryId, aptDateTime }
// providerName: optional string — if given, filter to matching provider only.
// Default appointment length: 60 minutes.
export async function getAvailability(serverUrl, customerKey, { windowDays = 7, providerName = null }) {
  const startDate = new Date().toISOString().slice(0, 10);
  const end = new Date();
  end.setDate(end.getDate() + windowDays);
  const stopDate = end.toISOString().slice(0, 10);

  let providers = [];
  if (providerName) {
    try {
      const all = await getProviders(serverUrl, customerKey);
      providers = all.filter(
        (p) => `${p.FName} ${p.LName}`.toLowerCase().includes(providerName.toLowerCase())
               || p.Abbr?.toLowerCase().includes(providerName.toLowerCase())
      );
    } catch { /* ignore provider filter failure — fall back to all providers */ }
  }

  const params = new URLSearchParams({
    startDate,
    stopDate,
    length: '60',
  });
  if (providers.length === 1) params.set('provNum', String(providers[0].ProvNum));

  const slots = await odFetch(serverUrl, customerKey, `/openslots?${params}`);
  if (!Array.isArray(slots)) return [];

  return slots.slice(0, 5).map((s) => {
    const dt = new Date(s.AptDateTime || s.aptDateTime);
    return {
      aptDateTime: s.AptDateTime || s.aptDateTime,
      date: dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      time: dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      provider: s.ProviderName || s.provAbbr || 'the doctor',
      providerId: s.ProvNum,
      operatoryId: s.Op || s.OperatoryNum,
    };
  });
}
```

- [ ] **Step 3: Add createAppointment**

```js
// Book an appointment. mode controls AptStatus:
//   'autonomous' → AptStatus 1 (Scheduled — appears confirmed in Open Dental)
//   'pending'    → AptStatus 6 (Unscheduled — front desk must confirm)
//   'collect_only' → never call this function; handle at caller level
export async function createAppointment(serverUrl, customerKey, {
  patientId, aptDateTime, operatoryId, providerId, reason, mode,
}) {
  const aptStatus = mode === 'pending' ? 6 : 1;
  const body = {
    PatNum: patientId,
    AptDateTime: aptDateTime,
    Op: operatoryId,
    ProvNum: providerId,
    ProcDescript: reason || 'General appointment',
    AptStatus: aptStatus,
  };
  try {
    const apt = await odFetch(serverUrl, customerKey, '/appointments', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!apt?.AptNum) throw new OpenDentalError('UNREACHABLE', 'No AptNum in response');
    return apt;
  } catch (e) {
    if (e instanceof OpenDentalError) {
      // Re-classify 409 Conflict (slot taken) if we can detect it
      if (e.message.includes('409') || e.message.toLowerCase().includes('conflict')) {
        throw new OpenDentalError('SLOT_TAKEN', 'That slot was just booked by someone else');
      }
      throw e;
    }
    throw new OpenDentalError('UNREACHABLE', e.message);
  }
}
```

- [ ] **Step 4: Verify the file still loads cleanly**

```bash
cd railway && node --input-type=module <<'EOF'
import { findPatient, createPatient, getProviders, getAvailability, createAppointment, OpenDentalError } from './opendental.js';
console.log('all exports present:', [findPatient, createPatient, getProviders, getAvailability, createAppointment, OpenDentalError].every(Boolean));
EOF
```

Expected: `all exports present: true`

- [ ] **Step 5: Commit**

```bash
git add railway/opendental.js
git commit -m "feat: add getProviders, getAvailability, createAppointment to opendental.js"
```

---

## Task 4: `server.js` — Intent Detection + Booking Prompt Helpers

**Files:**
- Modify: `railway/server.js`

- [ ] **Step 1: Add import at the top of server.js (after the existing imports)**

After the `process.on('unhandledRejection')` block, add:

```js
import { findPatient, createPatient, getAvailability, createAppointment, OpenDentalError } from './opendental.js';
```

- [ ] **Step 2: Add the intent detection function**

Add this function after the `safeParse` function (around line 190):

```js
// ============================================================================
// Booking intent detection — fast, non-streaming, returns true/false
// ============================================================================
async function detectBookingIntent(userText) {
  const system = 'You are a classifier. Reply with only "yes" or "no". Does the caller want to schedule, book, change, or cancel a dental appointment?';
  const messages = [{ role: 'user', content: userText }];
  try {
    const reply = USE_GROQ
      ? await callGroq(system, messages, null)
      : await callClaude(system, messages, null);
    return reply.toLowerCase().startsWith('yes');
  } catch {
    return false; // on any error, don't enter booking mode
  }
}
```

- [ ] **Step 3: Add the booking system prompt builder**

Add this function immediately after `detectBookingIntent`:

```js
// ============================================================================
// Booking-specific system prompt — used instead of buildSystemPrompt during booking
// ============================================================================
function buildBookingPrompt(business, stage, bookingState) {
  const name = business.ai_name || 'Claire';
  const practice = business.name;

  if (stage === 'collecting') {
    const collected = [];
    if (bookingState.name)               collected.push(`name: ${bookingState.name}`);
    if (bookingState.phone)              collected.push(`phone: ${bookingState.phone}`);
    if (bookingState.dob)                collected.push(`date of birth: ${bookingState.dob}`);
    if (bookingState.reason)             collected.push(`reason: ${bookingState.reason}`);
    if (bookingState.providerPreference) collected.push(`preferred doctor: ${bookingState.providerPreference}`);
    const missing = ['name','phone','dob','reason'].filter((f) => !bookingState[f]);

    return `You are ${name}, the AI receptionist for ${practice}. You are collecting information to book a dental appointment.

So far you have collected: ${collected.join(', ') || 'nothing yet'}.
Still needed: ${missing.join(', ')}.

Ask for ONE missing field at a time in a natural, conversational way. Keep responses to one sentence.
- For date of birth, ask: "And could I get your date of birth?"
- For reason, ask: "What's the reason for your visit?"
- After collecting all four required fields, ask: "Do you have a preferred doctor, or is any available provider fine?"

When you have collected all four required fields AND the provider preference (even if "no preference"), end your response with this exact marker on a new line:
[BOOKING_DATA:{"name":"FULL_NAME","phone":"PHONE","dob":"DOB","reason":"REASON","provider":"PROVIDER_OR_EMPTY"}]

Replace each field with the actual value. Use empty string for provider if caller has no preference. Do not include this marker until you have all five values. Never speak the marker aloud — it will be stripped automatically.`;
  }

  if (stage === 'checking') {
    const slots = bookingState.availableSlots || [];
    const slotList = slots
      .slice(0, 3)
      .map((s, i) => `${i + 1}. ${s.date} at ${s.time} with ${s.provider}`)
      .join('\n');
    return `You are ${name}, the AI receptionist for ${practice}. You have the following open appointment slots:

${slotList}

Read these options naturally to the caller and ask which one works for them. Keep it conversational. One or two sentences maximum. Do not use lists or numbers — say "I have Tuesday April 15th at 2pm with Dr Smith, or Thursday April 17th at 10am with Dr Patel."`;
  }

  if (stage === 'confirming') {
    const s = bookingState.chosenSlot;
    return `You are ${name}, the AI receptionist for ${practice}. You are confirming an appointment booking.

Patient name: ${bookingState.name}
Slot: ${s ? `${s.date} at ${s.time} with ${s.provider}` : 'the chosen slot'}

Read back the appointment details clearly and ask the caller to confirm. One or two sentences. Example: "Perfect, I'll book you in for Tuesday April 15th at 2pm with Dr Smith. Shall I go ahead and confirm that?"`;
  }

  return buildSystemPrompt(business); // fallback to normal prompt
}
```

- [ ] **Step 4: Add the slot-choice extractor**

```js
// Parse which slot the caller chose from their response text.
// Returns the matching slot object or null.
async function extractSlotChoice(userText, availableSlots) {
  if (!availableSlots.length) return null;
  const slotDescriptions = availableSlots
    .slice(0, 3)
    .map((s, i) => `Option ${i + 1}: ${s.date} at ${s.time} with ${s.provider}`)
    .join('\n');
  const system = `The caller was offered these appointment slots:\n${slotDescriptions}\n\nReply with ONLY a number (1, 2, or 3) indicating which slot the caller chose, or "none" if unclear.`;
  try {
    const reply = USE_GROQ
      ? await callGroq(system, [{ role: 'user', content: userText }], null)
      : await callClaude(system, [{ role: 'user', content: userText }], null);
    const num = parseInt(reply.trim(), 10);
    if (num >= 1 && num <= availableSlots.length) return availableSlots[num - 1];
  } catch { /* fall through */ }
  return null;
}
```

- [ ] **Step 5: Verify server.js still starts**

```bash
cd railway && node server.js &
sleep 2
kill %1
```

Expected: starts without import or syntax errors (may show connection errors for missing env vars — that's fine).

- [ ] **Step 6: Commit**

```bash
git add railway/server.js
git commit -m "feat: add booking intent detection and prompt helpers to server.js"
```

---

## Task 5: `server.js` — Booking State Machine + processTurn Integration

**Files:**
- Modify: `railway/server.js`

- [ ] **Step 1: Add bookingState to per-call state variables**

In the `app.ws('/media-stream', ...)` handler, find the block that starts:
```js
// Per-call state
let streamSid        = null;
```

Add these two lines at the end of that block (before the `const SILENCE_TIMEOUT_MS` line):

```js
  let bookingState     = { stage: 'idle', name: null, phone: null, dob: null, reason: null, providerPreference: null, availableSlots: [], chosenSlot: null, patientId: null };
```

- [ ] **Step 2: Add the collectOnly fallback SMS helper**

Add this function after `generateCallSummary` (around line 448):

```js
// SMS to front desk when collect_only mode or Open Dental offline fallback
async function sendBookingCollectedSms(business, bookingState) {
  if (!business.phone_number) return;
  const mode = business.opendental_booking_mode || 'autonomous';
  let body;
  if (mode === 'collect_only') {
    body = `Appointment request via AI — ${bookingState.name || 'Unknown'}, ${bookingState.phone || 'no phone'}, DOB: ${bookingState.dob || 'not given'}, reason: ${bookingState.reason || 'not given'}. Please confirm a time.`;
  } else {
    body = `Booking attempted via AI but Open Dental offline — ${bookingState.name || 'Unknown'}, ${bookingState.phone || 'no phone'}, DOB: ${bookingState.dob || 'not given'}, reason: ${bookingState.reason || 'not given'}. Please follow up.`;
  }
  await sendSms(business.phone_number, business.twilio_sid, body).catch(() => {});
}
```

- [ ] **Step 3: Replace the processTurn function**

Find the entire `async function processTurn(userText) { ... }` block (lines ~689–748) and replace it with:

```js
  // ------------------------------------------------------------------
  // Process a completed user turn (called from both speech_final and UtteranceEnd)
  // ------------------------------------------------------------------
  async function processTurn(userText) {
    if (isSpeaking) return;
    resetSilenceTimer();
    isSpeaking = true;

    console.log(`[User] ${userText}`);

    // Flush heard sentences from previous turn
    if (heardSentences.length > 0) {
      const heardText = heardSentences.join(' ');
      messages.push({ role: 'assistant', content: heardText });
      if (conversationId) saveMessage(conversationId, 'assistant', heardText).catch(() => {});
      heardSentences = [];
    }

    messages.push({ role: 'user', content: userText });
    if (conversationId) saveMessage(conversationId, 'user', userText).catch((e) => console.error('[DB save]', e.message));

    heardSentences = [];
    abortController = new AbortController();
    const mySignal = abortController.signal;
    const myTurn   = ++turnId;

    try {
      // ── Check for booking intent when idle ───────────────────────────────
      if (bookingState.stage === 'idle' && business?.opendental_booking_mode !== undefined) {
        const isBooking = await detectBookingIntent(userText);
        if (isBooking) {
          bookingState.stage = 'collecting';
          console.log('[Booking] Intent detected — entering collection stage');
        }
      }

      // ── Booking state machine ────────────────────────────────────────────
      if (bookingState.stage === 'collecting') {
        // Try to extract booking data marker from a previous assistant message
        // (the marker is appended by the LLM when all fields are collected)
        const lastAssistant = messages.filter((m) => m.role === 'assistant').pop();
        if (lastAssistant) {
          const match = lastAssistant.content.match(/\[BOOKING_DATA:(\{.*?\})\]/);
          if (match) {
            try {
              const data = JSON.parse(match[1]);
              bookingState.name               = data.name     || bookingState.name;
              bookingState.phone              = data.phone    || bookingState.phone;
              bookingState.dob                = data.dob      || bookingState.dob;
              bookingState.reason             = data.reason   || bookingState.reason;
              bookingState.providerPreference = data.provider || null;
              // Strip the marker from the stored message so it doesn't affect LLM context
              lastAssistant.content = lastAssistant.content.replace(/\[BOOKING_DATA:.*?\]/, '').trim();
              console.log('[Booking] Collected all fields:', bookingState);
            } catch { /* malformed marker — keep collecting */ }
          }
        }

        // Check if we have all fields
        const allCollected = bookingState.name && bookingState.phone && bookingState.dob && bookingState.reason;

        if (allCollected) {
          const mode = business?.opendental_booking_mode || 'autonomous';
          const hasOD = business?.opendental_api_key && business?.opendental_server_url;

          if (!hasOD || mode === 'collect_only') {
            // No Open Dental connection or collect_only mode — fallback
            await sendBookingCollectedSms(business, bookingState);
            bookingState.stage = 'done';
            const reply = `Thank you ${bookingState.name}. I've taken your details and our team will be in touch to confirm a time. Is there anything else I can help you with?`;
            await speakToTwilio(reply, ws, streamSid, mySignal);
            messages.push({ role: 'assistant', content: reply });
            if (conversationId) saveMessage(conversationId, 'assistant', reply).catch(() => {});
            isSpeaking = false;
            return;
          }

          // Fetch availability from Open Dental
          bookingState.stage = 'checking';
          try {
            const slots = await getAvailability(
              business.opendental_server_url,
              business.opendental_api_key,
              { windowDays: business.opendental_booking_window || 7, providerName: bookingState.providerPreference }
            );
            if (!slots.length) throw new OpenDentalError('UNREACHABLE', 'No slots returned');
            bookingState.availableSlots = slots;
            console.log('[Booking] Got', slots.length, 'available slots');
          } catch (e) {
            console.error('[Booking] getAvailability failed:', e.message);
            await sendBookingCollectedSms(business, bookingState);
            bookingState.stage = 'done';
            const reply = `I wasn't able to check our online calendar just now. I've noted your details and our team will call you back to confirm a time. Is there anything else I can help you with?`;
            await speakToTwilio(reply, ws, streamSid, mySignal);
            messages.push({ role: 'assistant', content: reply });
            if (conversationId) saveMessage(conversationId, 'assistant', reply).catch(() => {});
            isSpeaking = false;
            return;
          }
        }
      }

      if (bookingState.stage === 'checking') {
        // Try to extract slot choice from caller's message
        const chosen = await extractSlotChoice(userText, bookingState.availableSlots);
        if (chosen) {
          bookingState.chosenSlot = chosen;
          bookingState.stage = 'confirming';
          console.log('[Booking] Caller chose slot:', chosen);
        }
      }

      if (bookingState.stage === 'confirming') {
        // Detect yes/no confirmation
        const confirmed = /\b(yes|yeah|yep|sure|confirm|go ahead|book it|that works|perfect|great)\b/i.test(userText);
        const declined  = /\b(no|nope|cancel|don't|different|another|change)\b/i.test(userText);

        if (confirmed && bookingState.chosenSlot) {
          // Book the appointment
          try {
            // Find or create patient
            let patient = await findPatient(
              business.opendental_server_url,
              business.opendental_api_key,
              { name: bookingState.name, phone: bookingState.phone, dob: bookingState.dob }
            );
            if (!patient) {
              patient = await createPatient(
                business.opendental_server_url,
                business.opendental_api_key,
                { name: bookingState.name, phone: bookingState.phone, dob: bookingState.dob, reason: bookingState.reason }
              );
            }
            bookingState.patientId = patient.PatNum;

            const s = bookingState.chosenSlot;
            const mode = business.opendental_booking_mode || 'autonomous';
            const apt = await createAppointment(
              business.opendental_server_url,
              business.opendental_api_key,
              { patientId: patient.PatNum, aptDateTime: s.aptDateTime, operatoryId: s.operatoryId, providerId: s.providerId, reason: bookingState.reason, mode }
            );
            bookingState.stage = 'done';

            // Save appointment_id to conversation
            if (conversationId) {
              supabaseRequest(`conversations?id=eq.${conversationId}`, {
                method: 'PATCH',
                body: JSON.stringify({ appointment_id: String(apt.AptNum), appointment_requested: true }),
                headers: { Prefer: 'return=minimal' },
              }).catch(() => {});
            }

            // SMS the practice
            if (business.phone_number) {
              const smsMode = mode === 'pending' ? '(pending confirmation)' : '(confirmed)';
              sendSms(business.phone_number, business.twilio_sid,
                `Appointment booked via AI ${smsMode} — ${bookingState.name}, ${s.date} at ${s.time} with ${s.provider}, reason: ${bookingState.reason}`
              ).catch(() => {});
            }

            const confirmMsg = mode === 'autonomous'
              ? `You're all booked. ${bookingState.name}, we have you down for ${s.date} at ${s.time} with ${s.provider}. You'll receive a confirmation shortly. Is there anything else I can help you with?`
              : `I've submitted your appointment request for ${s.date} at ${s.time} with ${s.provider}. Our team will confirm it with you shortly. Is there anything else I can help you with?`;

            await speakToTwilio(confirmMsg, ws, streamSid, mySignal);
            messages.push({ role: 'assistant', content: confirmMsg });
            if (conversationId) saveMessage(conversationId, 'assistant', confirmMsg).catch(() => {});
            isSpeaking = false;
            return;

          } catch (e) {
            console.error('[Booking] createAppointment failed:', e.code, e.message);
            if (e.code === 'SLOT_TAKEN') {
              // Re-fetch and offer next slots
              try {
                const newSlots = await getAvailability(
                  business.opendental_server_url,
                  business.opendental_api_key,
                  { windowDays: business.opendental_booking_window || 7 }
                );
                bookingState.availableSlots = newSlots;
                bookingState.stage = 'checking';
                bookingState.chosenSlot = null;
                const retryMsg = `It looks like that slot just filled up. Let me find you the next available time.`;
                await speakToTwilio(retryMsg, ws, streamSid, mySignal);
                // Fall through to normal LLM turn which will offer new slots
              } catch {
                // Total fallback
                await sendBookingCollectedSms(business, bookingState);
                bookingState.stage = 'done';
                const fallback = `I'm having trouble booking online right now. I've noted your details and our team will call you to confirm. Is there anything else I can help you with?`;
                await speakToTwilio(fallback, ws, streamSid, mySignal);
                messages.push({ role: 'assistant', content: fallback });
                if (conversationId) saveMessage(conversationId, 'assistant', fallback).catch(() => {});
                isSpeaking = false;
                return;
              }
            } else {
              // UNREACHABLE or INVALID_KEY — fallback
              await sendBookingCollectedSms(business, bookingState);
              bookingState.stage = 'done';
              const fallback = `I'm having trouble reaching our booking system right now. I've noted your details and our team will call you to confirm. Is there anything else I can help you with?`;
              await speakToTwilio(fallback, ws, streamSid, mySignal);
              messages.push({ role: 'assistant', content: fallback });
              if (conversationId) saveMessage(conversationId, 'assistant', fallback).catch(() => {});
              isSpeaking = false;
              return;
            }
          }
        }

        if (declined) {
          // Caller doesn't want that slot — go back to checking
          bookingState.stage = 'checking';
          bookingState.chosenSlot = null;
        }
      }

      // ── Normal LLM turn (also handles booking collection/slot offering) ──
      const activePrompt = (bookingState.stage !== 'idle' && bookingState.stage !== 'done')
        ? buildBookingPrompt(business, bookingState.stage, bookingState)
        : systemPrompt;

      const reply = await streamLLMAndSpeak(activePrompt, messages, mySignal, ws, streamSid, heardSentences);
      if (!reply || mySignal.aborted) return;

      console.log(`[AI] ${reply}`);
      heardSentences = [];

      // Strip BOOKING_DATA marker from spoken/stored reply (already processed above on next turn)
      const cleanReply = reply.replace(/\[BOOKING_DATA:.*?\]/, '').trim();
      messages.push({ role: 'assistant', content: cleanReply });
      if (conversationId) saveMessage(conversationId, 'assistant', cleanReply).catch((e) => console.error('[DB save]', e.message));

    } catch (e) {
      if (e.name !== 'AbortError') console.error('[AI]', e.message);
    } finally {
      if (myTurn === turnId) {
        isSpeaking = false;
        abortController = null;
      }
    }
  }
```

- [ ] **Step 4: Add OPENDENTAL_DEVELOPER_KEY to env var declarations at top of server.js**

Find the block at the top:
```js
const SUPABASE_URL        = process.env.SUPABASE_URL;
```

Add after it:
```js
const OPENDENTAL_DEVELOPER_KEY = process.env.OPENDENTAL_DEVELOPER_KEY; // set in Railway env
```

- [ ] **Step 5: Verify server.js starts without errors**

```bash
cd railway && node server.js &
sleep 3
kill %1 2>/dev/null
```

Expected: starts without syntax errors. Will show env var warnings — that's fine.

- [ ] **Step 6: Commit**

```bash
git add railway/server.js
git commit -m "feat: add booking state machine and processTurn integration"
```

---

## Task 6: Settings API — Persist Open Dental Fields

**Files:**
- Modify: `app/api/settings/route.ts`

- [ ] **Step 1: Update the destructure block**

Find:
```ts
  const {
    name, businessType, hours, services,
    aiName, aiGreeting, customPrompt, faqs, voiceEnabled,
    voiceTone, voiceEmergencyNumber, voiceEmergencyMessage,
    voiceDeflectTopics, voiceScenarios,
  } = body;
```

Replace with:
```ts
  const {
    name, businessType, hours, services,
    aiName, aiGreeting, customPrompt, faqs, voiceEnabled,
    voiceTone, voiceEmergencyNumber, voiceEmergencyMessage,
    voiceDeflectTopics, voiceScenarios,
    openDentalServerUrl, openDentalApiKey, openDentalBookingMode, openDentalBookingWindow,
  } = body;
```

- [ ] **Step 2: Update the Supabase update call**

Find:
```ts
      voice_scenarios: voiceScenarios ?? [],
```

Add after it:
```ts
      opendental_server_url: openDentalServerUrl ?? null,
      opendental_api_key: openDentalApiKey ?? null,
      opendental_booking_mode: openDentalBookingMode ?? 'autonomous',
      opendental_booking_window: openDentalBookingWindow ?? 7,
```

- [ ] **Step 3: Verify the file is valid TypeScript**

```bash
cd /Users/daryllvasconcellos/hustleclaude && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors on `app/api/settings/route.ts`. (Other pre-existing errors elsewhere are fine.)

- [ ] **Step 4: Commit**

```bash
git add app/api/settings/route.ts
git commit -m "feat: persist Open Dental fields in settings API"
```

---

## Task 7: Settings API — Test Connection Route

**Files:**
- Create: `app/api/settings/opendental-test/route.ts`

- [ ] **Step 1: Create the route**

```ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// Tests an Open Dental API key by calling /providers.
// Returns { ok: true } on success or { error: string } on failure.
// Does NOT save the key — for UI validation only.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { serverUrl, apiKey } = await req.json();
  if (!serverUrl?.trim() || !apiKey?.trim()) {
    return Response.json({ error: "Server URL and API key are required" }, { status: 400 });
  }

  const developerKey = process.env.OPENDENTAL_DEVELOPER_KEY;
  if (!developerKey) {
    return Response.json({ error: "Developer key not configured on server" }, { status: 500 });
  }

  const base = serverUrl.trim().replace(/\/$/, "");
  const url = `${base}/api/v1/providers`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `ODFHIR ${developerKey}/${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: `Could not reach Open Dental server: ${msg}` }, { status: 200 });
  }

  if (res.status === 401 || res.status === 403) {
    return Response.json({ error: "Invalid API key — Open Dental rejected the credentials" }, { status: 200 });
  }
  if (!res.ok) {
    return Response.json({ error: `Open Dental returned ${res.status}` }, { status: 200 });
  }

  return Response.json({ ok: true });
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/daryllvasconcellos/hustleclaude && npx tsc --noEmit 2>&1 | grep "opendental-test" | head -10
```

Expected: no lines output (no errors on this file).

- [ ] **Step 3: Commit**

```bash
git add app/api/settings/opendental-test/route.ts
git commit -m "feat: add Open Dental test-connection API route"
```

---

## Task 8: SettingsForm — Practice Management Card

**Files:**
- Modify: `components/SettingsForm.tsx`

- [ ] **Step 1: Update the Business type**

Find the `type Business = {` block. Add these fields before the closing `}`:

```ts
  opendental_server_url: string | null;
  opendental_api_key: string | null;
  opendental_booking_mode: "autonomous" | "pending" | "collect_only" | null;
  opendental_booking_window: number | null;
```

- [ ] **Step 2: Add state variables**

Find the last `useState` block (around `voiceScenarios`). After it, add:

```tsx
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
```

- [ ] **Step 3: Add the test-connection handler**

Find the `async function handleSubmit` declaration. Add this function before it:

```tsx
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
```

- [ ] **Step 4: Add Open Dental fields to the form submit body**

Find the `body: JSON.stringify({` block in `handleSubmit`. Add these fields inside it (after `voiceScenarios`):

```ts
        openDentalServerUrl: odServerUrl || null,
        openDentalApiKey: odApiKey || null,
        openDentalBookingMode: odBookingMode,
        openDentalBookingWindow: odBookingWindow,
```

- [ ] **Step 5: Add the Practice Management card to the JSX**

Find the closing `</div>` of the last settings card (Voice Customization). After it (still inside the outer form wrapper), add:

```tsx
        {/* Practice Management */}
        <div className="border border-gray-200 rounded-2xl p-6 space-y-6">
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
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd /Users/daryllvasconcellos/hustleclaude && npx tsc --noEmit 2>&1 | grep "SettingsForm" | head -10
```

Expected: no lines output.

- [ ] **Step 7: Commit**

```bash
git add components/SettingsForm.tsx
git commit -m "feat: add Practice Management card to SettingsForm"
```

---

## Task 9: Settings Page — Pass New Fields

**Files:**
- Modify: `app/settings/page.tsx`

The settings page already passes `business={business}` with `select("*")` — this already fetches all columns including the new Open Dental ones. No change needed to the query.

- [ ] **Step 1: Verify the select query is `select("*")`**

Open `app/settings/page.tsx` line ~11. Confirm it reads:

```ts
    .select("*")
```

If it does, no change needed. If it lists specific columns, add the four new ones: `opendental_server_url, opendental_api_key, opendental_booking_mode, opendental_booking_window`.

- [ ] **Step 2: Commit (only if changes were needed)**

```bash
git add app/settings/page.tsx
git commit -m "feat: pass Open Dental fields to SettingsForm"
```

---

## Task 10: Dashboard — Nudge Card

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Find the right insertion point**

In `app/dashboard/page.tsx`, find the `{/* Billing */}` section (around line 59). The nudge card should be inserted after the billing section and before the embed code/conversation list.

Find this comment or nearby anchor:
```tsx
        {business.plan === "free" && (
```

- [ ] **Step 2: Add the nudge card**

Immediately after the closing `)}` of the `{business.plan === "free" && ...}` block, add:

```tsx
        {/* Open Dental nudge — shown to Pro/Multi without OD connected */}
        {(business.plan === "pro" || business.plan === "multi") && !business.opendental_api_key && (
          <div className="border border-blue-100 bg-blue-50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Enable Live Appointment Booking</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Connect Open Dental so your AI can check availability and book appointments directly during calls.
              </p>
            </div>
            <Link
              href="/settings#practice-management"
              className="shrink-0 text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-center"
            >
              Connect in Settings →
            </Link>
          </div>
        )}
```

- [ ] **Step 3: Add `id="practice-management"` anchor to the Settings card**

In `components/SettingsForm.tsx`, find the Practice Management card div:
```tsx
        <div className="border border-gray-200 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Practice Management</h2>
```

Change the outer div to:
```tsx
        <div id="practice-management" className="border border-gray-200 rounded-2xl p-6 space-y-6">
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Users/daryllvasconcellos/hustleclaude && npx tsc --noEmit 2>&1 | grep -E "dashboard|SettingsForm" | head -10
```

Expected: no lines output.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx components/SettingsForm.tsx
git commit -m "feat: add Open Dental nudge card to dashboard"
```

---

## Task 11: Railway Environment Variable

**Files:**
- Manual: Railway dashboard

- [ ] **Step 1: Add `OPENDENTAL_DEVELOPER_KEY` to Railway**

1. Go to your Railway project dashboard
2. Click on the `server` service
3. Go to **Variables** tab
4. Click **New Variable**
5. Name: `OPENDENTAL_DEVELOPER_KEY`
6. Value: your Open Dental developer key (received from vendor.relations@opendental.com)
7. Click **Add**
8. Railway will auto-redeploy — wait for the deployment to complete

Note: This step is blocked until the developer key arrives from Open Dental. The code is fully built and will activate automatically once this variable is set.

- [ ] **Step 2: Verify deployment**

After Railway redeploys, check the logs for:
```
[opendental] — if this line doesn't appear, that's fine. Check for any import errors instead.
```

No import errors = deployment successful.

---

## Task 12: End-to-End Verification (Manual)

Once the Open Dental developer key is set and at least one practice has connected their credentials:

- [ ] **Step 1: Test Settings UI**
  1. Go to `/settings`
  2. Scroll to Practice Management card — should be visible
  3. Enter server URL + customer key
  4. Click "Test Connection" — should show green "Connected successfully"
  5. Booking Mode and Availability Window radios should appear
  6. Click Save — no error

- [ ] **Step 2: Verify Dashboard nudge**
  1. Go to `/dashboard` with a Pro/Multi account that has no OD key
  2. Nudge card should be visible
  3. Click "Connect in Settings →" — should scroll to the Practice Management card
  4. After saving an API key: reload dashboard — nudge should be gone

- [ ] **Step 3: Test booking flow via `/voice-test`**
  1. Go to `/voice-test` and start a call
  2. Say: "I'd like to book an appointment"
  3. AI should switch to collecting: ask for name, phone, DOB, reason
  4. Provide all four fields
  5. AI should offer 2-3 available slots (or fall back to collect-and-notify if OD unreachable)
  6. Say "the first one"
  7. AI should confirm the slot and ask for confirmation
  8. Say "yes"
  9. Check Open Dental — appointment should appear
  10. Check `businesses.phone_number` phone — SMS notification should arrive

- [ ] **Step 4: Test fallback (no API key)**
  1. Remove `opendental_api_key` from a test business in Supabase
  2. Repeat steps 2-4 above
  3. AI should say "I'll take your details and have the team confirm a time" — no slot offering
  4. SMS should arrive with collected patient info
