// Lightweight classifiers used by chat + voice ingest to populate dashboard fields.
// Keep these regex-based for speed; promote to an Anthropic call later if accuracy matters.

export const URGENCY_RANK = { routine: 0, urgent: 1, emergency: 2 } as const;
export type UrgencyLevel = "emergency" | "urgent" | "routine";

type HoursEntry = { open: string | null; close: string | null; enabled: boolean };
type HoursMap = Record<string, HoursEntry>;

const EMERGENCY_KEYWORDS = [
  "emergency", "urgent pain", "severe pain", "toothache", "swelling", "swollen",
  "bleeding", "knocked out", "broken tooth", "abscess", "can't eat", "can't sleep",
  "throbbing", "excruciating",
];

const URGENT_KEYWORDS = [
  "pain", "hurts", "sensitive", "cavity", "filling fell out", "crown came off",
  "appointment", "book", "schedule", "reschedule", "billing", "insurance claim",
];

const APPOINTMENT_KEYWORDS = [
  "book", "schedule", "appointment", "reschedule", "cancel my", "available",
  "opening", "slot", "come in",
];

const CALLBACK_KEYWORDS = [
  "call me back", "callback", "call back", "reach me", "contact me",
  "get back to me", "return my call", "give me a call",
];

const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const EMAIL_RE = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

export function classifyUrgency(text: string): UrgencyLevel {
  const lower = text.toLowerCase();
  if (EMERGENCY_KEYWORDS.some((k) => lower.includes(k))) return "emergency";
  if (URGENT_KEYWORDS.some((k) => lower.includes(k))) return "urgent";
  return "routine";
}

export function detectAppointmentIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return APPOINTMENT_KEYWORDS.some((k) => lower.includes(k));
}

export function detectCallbackIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return CALLBACK_KEYWORDS.some((k) => lower.includes(k));
}

export function extractContact(text: string): { phone?: string; email?: string } {
  const phone = text.match(PHONE_RE)?.[1]?.replace(/[\s().-]/g, "");
  const email = text.match(EMAIL_RE)?.[1];
  return {
    phone: phone && phone.length >= 10 ? phone : undefined,
    email,
  };
}

// Check if a given timestamp falls outside business hours.
// Returns true when the business is closed at the given moment.
export function isAfterHours(
  hours: HoursMap | string | null | undefined,
  at: Date = new Date()
): boolean {
  if (!hours || typeof hours === "string") return false;

  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayKey = dayNames[at.getDay()];
  const entry = hours[dayKey];
  if (!entry || !entry.enabled || !entry.open || !entry.close) return true;

  const minutesNow = at.getHours() * 60 + at.getMinutes();
  const [oh, om] = entry.open.split(":").map(Number);
  const [ch, cm] = entry.close.split(":").map(Number);
  const openM = (oh ?? 0) * 60 + (om ?? 0);
  const closeM = (ch ?? 0) * 60 + (cm ?? 0);
  return minutesNow < openM || minutesNow >= closeM;
}
