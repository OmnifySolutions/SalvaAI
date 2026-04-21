type Business = {
  notify_on_emergency?: boolean;
  notify_emergency_phone?: string | null;
  notify_emergency_email?: string | null;
  notify_emergency_whatsapp?: string | null;
  notify_on_new_booking?: boolean;
  notify_on_callback?: boolean;
  name: string;
  twilio_sid?: string | null;
};

type ConversationSummary = {
  id: string;
  channel: string;
  visitor_name?: string | null;
  visitor_phone?: string | null;
  urgency?: string;
  appointment_notes?: string | null;
  summary?: string | null;
};

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER;
const RESEND_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "support@getsalvaai.com";

async function sendSmsAlert(to: string, body: string): Promise<void> {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) return;
  const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64");
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body }).toString(),
  }).catch((e) => console.error("SMS alert error:", e));
}

async function sendEmailAlert(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_KEY) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
  }).catch((e) => console.error("Email alert error:", e));
}

async function sendWhatsAppAlert(to: string, body: string): Promise<void> {
  if (!TWILIO_SID || !TWILIO_TOKEN) return;
  const waFrom = process.env.TWILIO_WHATSAPP_NUMBER ?? "whatsapp:+14155238886";
  const waTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64");
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: waTo, From: waFrom, Body: body }).toString(),
  }).catch((e) => console.error("WhatsApp alert error:", e));
}

function formatCaller(conv: ConversationSummary): string {
  return conv.visitor_name ?? conv.visitor_phone ?? "Unknown caller";
}

export async function sendEmergencyNotification(business: Business, conv: ConversationSummary): Promise<void> {
  if (!business.notify_on_emergency) return;
  const caller = formatCaller(conv);
  const channel = conv.channel === "voice" ? "📞 Phone call" : "💬 Chat";
  const msg = `🚨 DENTAL EMERGENCY — ${business.name}\n${channel} from ${caller}\n${conv.summary ?? conv.appointment_notes ?? "Patient reported a dental emergency."}\nReview in your SalvaAI dashboard.`;
  const subject = `🚨 Emergency Alert — ${business.name}`;
  const html = `<p><strong>Dental Emergency Reported</strong></p><p><strong>Practice:</strong> ${business.name}</p><p><strong>Channel:</strong> ${channel}</p><p><strong>Caller:</strong> ${caller}</p><p>${conv.summary ?? conv.appointment_notes ?? "Patient reported a dental emergency."}</p><p>Review and resolve in your <a href="https://salvaai.com/dashboard">SalvaAI dashboard</a>.</p>`;

  await Promise.allSettled([
    business.notify_emergency_phone ? sendSmsAlert(business.notify_emergency_phone, msg) : Promise.resolve(),
    business.notify_emergency_email ? sendEmailAlert(business.notify_emergency_email, subject, html) : Promise.resolve(),
    business.notify_emergency_whatsapp ? sendWhatsAppAlert(business.notify_emergency_whatsapp, msg) : Promise.resolve(),
  ]);
}

export async function sendBookingNotification(business: Business, conv: ConversationSummary): Promise<void> {
  if (!business.notify_on_new_booking) return;
  const caller = formatCaller(conv);
  const msg = `📅 New booking request — ${business.name}\nFrom: ${caller}\n${conv.appointment_notes ?? "Patient requested an appointment."}\nReview in your SalvaAI dashboard.`;
  const subject = `New Booking Request — ${business.name}`;
  const html = `<p><strong>New Booking Request</strong></p><p><strong>Practice:</strong> ${business.name}</p><p><strong>From:</strong> ${caller}</p><p>${conv.appointment_notes ?? "Patient requested an appointment."}</p><p>Review in your <a href="https://salvaai.com/dashboard">SalvaAI dashboard</a>.</p>`;

  await Promise.allSettled([
    business.notify_emergency_phone ? sendSmsAlert(business.notify_emergency_phone, msg) : Promise.resolve(),
    business.notify_emergency_email ? sendEmailAlert(business.notify_emergency_email, subject, html) : Promise.resolve(),
  ]);
}

export async function sendCallbackNotification(business: Business, conv: ConversationSummary): Promise<void> {
  if (!business.notify_on_callback) return;
  const caller = formatCaller(conv);
  const msg = `📞 Callback requested — ${business.name}\nFrom: ${caller}\nReview in your SalvaAI dashboard.`;
  const subject = `Callback Request — ${business.name}`;
  const html = `<p><strong>Callback Requested</strong></p><p><strong>Practice:</strong> ${business.name}</p><p><strong>From:</strong> ${caller}</p><p>Review in your <a href="https://salvaai.com/dashboard">SalvaAI dashboard</a>.</p>`;

  await Promise.allSettled([
    business.notify_emergency_phone ? sendSmsAlert(business.notify_emergency_phone, msg) : Promise.resolve(),
    business.notify_emergency_email ? sendEmailAlert(business.notify_emergency_email, subject, html) : Promise.resolve(),
  ]);
}
