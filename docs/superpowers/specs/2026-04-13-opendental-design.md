# Open Dental PMS Integration — Design Spec
**Date:** 2026-04-13
**Status:** Approved

---

## Overview

Integrate Open Dental's REST API so the voice AI can check real-time appointment availability and book appointments during live phone calls. Practices that have not connected Open Dental fall back to collect-and-notify automatically.

---

## Decisions

| Decision | Choice |
|---|---|
| Booking mode | Configurable per practice: autonomous / pending / collect-only |
| Patient info collected | Name + phone + DOB + reason for visit |
| Availability window | Configurable per practice: 3 / 7 / 14 days |
| Provider selection | AI asks caller preference; pulls live provider list from Open Dental |
| Architecture | Separate `railway/opendental.js` module (Option B) |
| Settings location | Settings page (config) + Dashboard nudge card (discovery) |
| Fallback | If no API key or Open Dental unreachable → collect-and-notify silently |

---

## 1. Database Schema

### `businesses` table — new columns

```sql
opendental_api_key       TEXT          -- null = not connected; encrypted at rest
opendental_booking_mode  TEXT DEFAULT 'autonomous'
                         -- 'autonomous' | 'pending' | 'collect_only'
opendental_booking_window INT DEFAULT 7  -- 3 | 7 | 14 (days)
```

### `conversations` table — new column

```sql
appointment_id  TEXT   -- Open Dental appointment ID; null if not booked via PMS
```

Tracks which conversations resulted in a confirmed PMS booking vs. a collect-and-notify.

---

## 2. `railway/opendental.js` Module

Self-contained Open Dental API client. Imported by `server.js`. All functions are async and throw `OpenDentalError` with a `code` field on failure.

### Exports

**`findPatient(apiKey, { name, phone, dob })`**
Search for an existing patient by name + DOB. Returns patient record or `null` (new patient). DOB is the reliable deduplication key in Open Dental.

**`createPatient(apiKey, { name, phone, dob, email, reason })`**
Create a new patient record. Returns the new patient ID.

**`getAvailability(apiKey, { windowDays, providerName })`**
Return open appointment slots within `windowDays` from today. `providerName` is optional — omit to return slots across all providers. Returns array of `{ date, time, provider, providerId, operatoryId }`.

**`createAppointment(apiKey, { patientId, slotDate, slotTime, operatoryId, providerId, reason, mode })`**
Book the appointment. `mode` determines confirmed vs. pending status:
- `'autonomous'` → confirmed appointment
- `'pending'` → unconfirmed/pending appointment (front desk confirms in Open Dental)
- `'collect_only'` → this function is never called; server.js sends SMS only

### Error codes

| Code | Meaning |
|---|---|
| `INVALID_KEY` | API key rejected by Open Dental |
| `UNREACHABLE` | Network error / Open Dental server offline |
| `SLOT_TAKEN` | Slot was booked between availability check and creation |
| `PATIENT_ERROR` | Failed to create or retrieve patient record |

---

## 3. Booking Flow in `server.js`

### Intent detection

After each caller utterance, a secondary non-streaming LLM call (~100ms) checks:
> "Does this caller want to book, change, or cancel an appointment? Reply yes or no."

If `yes`, the call session enters booking mode.

### Session state machine

A `bookingState` object is attached to each call session:

```js
{
  stage: 'idle' | 'collecting' | 'checking' | 'confirming' | 'done',
  name: null,
  phone: null,
  dob: null,
  reason: null,
  providerPreference: null,
  chosenSlot: null,
}
```

**Stage transitions:**

- `idle` → normal AI conversation
- `collecting` → AI collects name, phone, DOB, reason one at a time conversationally; then asks "do you have a preferred doctor?"
- `checking` → calls `getAvailability()`, reads back up to 3 slots, asks caller to pick one
- `confirming` → reads back chosen slot + patient name, asks "shall I go ahead and book that?"
- `done` → calls `createAppointment()` (or saves + sends SMS for collect_only), speaks confirmation

### No API key / offline fallback

If `business.opendental_api_key` is null, or `getAvailability()` throws `UNREACHABLE` or `INVALID_KEY`: skip `checking` and `confirming` stages entirely. AI says: "Let me take your details and have the team confirm a time with you." Saves collected info to conversation record, sends post-call SMS to practice.

### Post-booking SMS

Sent to `businesses.phone_number` via existing `sendSms()` helper:
> "New appointment booked via AI — [Patient name], [date] at [time] with [provider], reason: [reason]."

For `collect_only` mode or fallback:
> "Appointment request via AI — [Patient name], [phone], preferred: [reason]. Please confirm a time."

---

## 4. Settings UI

### Settings page — "Practice Management" card

New card below the Voice Customization section in `components/SettingsForm.tsx`.

```
┌─ Practice Management ──────────────────────────────────┐
│  Open Dental                          [Connected ✓]    │
│                                                        │
│  API Key  [••••••••••••••]  [Test Connection]          │
│                                                        │
│  Booking Mode                                          │
│  ○ Fully autonomous  — AI books directly               │
│  ○ Hold for confirmation  — front desk confirms        │
│  ○ Collect only  — AI takes details, team books        │
│                                                        │
│  Availability Window                                   │
│  ○ Next 3 days  ○ Next 7 days  ○ Next 14 days         │
│                                                        │
│                              [Save Changes]            │
└────────────────────────────────────────────────────────┘
```

"Test Connection" calls `/api/settings/opendental-test` — validates the entered key against Open Dental without saving. Shows inline green "Connected" or red "Invalid key" feedback.

Booking Mode and Availability Window radio groups are only shown after a valid API key is connected.

### Dashboard nudge card

Shown when `opendental_api_key` is null and plan is `pro` or `multi`. Hidden once connected.

```
┌─ Enable Live Appointment Booking ──────────────────────┐
│  Connect Open Dental so your AI can check availability │
│  and book appointments directly during calls.          │
│                          [Connect in Settings →]       │
└────────────────────────────────────────────────────────┘
```

---

## 5. Error Handling

All failure modes are silent to the caller — the AI always has a graceful recovery path.

| Failure | Caller experience | Practice experience |
|---|---|---|
| Open Dental offline / unreachable | Falls back to collect-and-notify; AI takes details normally | SMS received with collected info; dashboard shows "Connection error" |
| Invalid or expired API key | Falls back to collect-and-notify | Dashboard badge flips to "Connection error — check your API key" |
| Slot taken between check and booking | AI says "that slot just filled up, let me find the next one"; re-queries availability | Transparent — booking just happens with a different slot |
| No slots in window | AI says "we don't have openings in the next X days online, let me have the team call you" | SMS received |

---

## 6. Files Changed

| File | Change |
|---|---|
| `docs/SCHEMA.sql` | Add 3 columns to businesses, 1 to conversations |
| `railway/opendental.js` | New file — Open Dental API client |
| `railway/server.js` | Import opendental.js; add intent detection + booking state machine |
| `components/SettingsForm.tsx` | Add Practice Management card |
| `app/api/settings/route.ts` | Persist 3 new fields |
| `app/api/settings/opendental-test/route.ts` | New route — test connection endpoint |
| `app/dashboard/page.tsx` | Add nudge card for unconnected Pro/Multi plans |

---

## Out of Scope (Post-MVP)

- Dentrix / Eaglesoft integrations (same module interface, new files)
- Appointment cancellation or rescheduling via voice
- Insurance verification via PMS
- Configuring which specific providers the AI can book with
- Custom booking window beyond 3/7/14 days
