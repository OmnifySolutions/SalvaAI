import express from 'express';
import expressWs from 'express-ws';
import WebSocket from 'ws';
import { findPatient, createPatient, getAvailability, createAppointment, OpenDentalError } from './opendental.js';

// Prevent unhandled promise rejections from crashing the Railway process.
// All per-call errors are caught locally; this is a safety net for anything missed.
process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection]', reason);
});

const app = express();
expressWs(app);

const PORT = process.env.PORT || 8080;
const DEEPGRAM_API_KEY    = process.env.DEEPGRAM_API_KEY;
const ANTHROPIC_API_KEY   = process.env.ANTHROPIC_API_KEY;
const GROQ_API_KEY        = process.env.GROQ_API_KEY;
// Feature flag: set GROQ_API_KEY in Railway env to use Groq (testing). Remove to use Claude (production).
const USE_GROQ            = !!GROQ_API_KEY;
const ELEVENLABS_API_KEY  = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TWILIO_ACCOUNT_SID  = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN;

// ============================================================================
// Supabase REST helpers (no SDK)
// ============================================================================
async function supabaseRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase ${res.status}: ${body}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function getBusinessByConversationId(conversationId) {
  const conv = await supabaseRequest(
    `conversations?id=eq.${conversationId}&select=business_id`
  );
  if (!conv?.[0]) return null;
  const biz = await supabaseRequest(
    `businesses?id=eq.${conv[0].business_id}&select=*`
  );
  return biz?.[0] || null;
}

async function saveMessage(conversationId, role, content) {
  return supabaseRequest('messages', {
    method: 'POST',
    body: JSON.stringify({ conversation_id: conversationId, role, content }),
    headers: { Prefer: 'return=minimal' },
  });
}

async function endConversation(conversationId, summary = null) {
  const update = { status: 'completed', ended_at: new Date().toISOString() };
  if (summary) update.summary = summary;
  return supabaseRequest(`conversations?id=eq.${conversationId}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
    headers: { Prefer: 'return=minimal' },
  });
}

// ============================================================================
// Twilio SMS (raw REST, no SDK)
// ============================================================================
async function sendSms(to, from, body) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !to || !from) return;
  const creds = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    }
  );
  if (!res.ok) console.error('[SMS] Error:', res.status, await res.text().catch(() => ''));
  else console.log(`[SMS] Sent to ${to}`);
}

// ============================================================================
// System prompt builder (phone-optimised, no markdown/lists)
// ============================================================================
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
    ? `Emergency handling: If a caller describes a dental emergency, ${business.voice_emergency_message || 'direct them to seek immediate care.'} ${business.voice_emergency_number ? `The emergency line is ${business.voice_emergency_number}.` : ''}`
    : `If a caller describes a dental emergency, tell them you will flag it as urgent and have someone call them back immediately.`;

  // ── Deflection (PRIORITY — injected before scenarios) ───────────────────────
  const deflectLabels = {
    appointments:        'appointment requests or scheduling',
    insurance:           'insurance or billing questions',
    cost:                'treatment cost or pricing questions',
    clinical_advice:     'clinical or medical advice',
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
- For clinical or medical questions, do not speculate — tell the caller a team member will follow up.
- If you don't know something, offer to have the office follow up.
- Do not volunteer that you are an AI unless directly asked.
- Never say "pause", "(pause)", "one moment", "hold on", "just a second", or any filler placeholder. If you need to check something, say so naturally in one sentence without placeholders.
- You are a dental office receptionist. Only offer dental appointments and dental services. Never suggest non-dental appointment types.`;
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}

// ============================================================================
// Booking intent detection — fast, non-streaming, returns true/false
// ============================================================================
async function detectBookingIntent(userText) {
  const system = 'You are a classifier. Reply with only "yes" or "no". Does the caller want to schedule, book, change, or cancel a dental appointment?';
  try {
    if (USE_GROQ) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 5,
          messages: [{ role: 'system', content: system }, { role: 'user', content: userText }],
        }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim().toLowerCase().startsWith('yes') ?? false;
    } else {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 5,
          system,
          messages: [{ role: 'user', content: userText }],
        }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.content?.[0]?.text?.trim().toLowerCase().startsWith('yes') ?? false;
    }
  } catch {
    return false;
  }
}

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
      .map((s) => `${s.date} at ${s.time} with ${s.provider}`)
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

// ============================================================================
// LLM helpers — Groq (testing) or Claude Haiku (production)
// Switch by setting/removing GROQ_API_KEY in Railway env vars.
// ============================================================================

// Non-streaming versions — used only for post-call summary generation
async function callGroq(systemPrompt, messages, signal) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
    signal,
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

async function callClaude(systemPrompt, messages, signal) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemPrompt,
      messages,
    }),
    signal,
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text?.trim() || '';
}

// ── Streaming helpers ────────────────────────────────────────────────────────
// Each calls onToken(string) for every token chunk, returns when stream ends.

async function streamGroq(systemPrompt, messages, signal, onToken) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
    signal,
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let partial   = '';

  while (true) {
    if (signal?.aborted) break;
    const { done, value } = await reader.read();
    if (done) break;
    partial += decoder.decode(value, { stream: true });

    const lines = partial.split('\n');
    partial = lines.pop(); // keep any incomplete line

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const json  = JSON.parse(trimmed.slice(6));
          const token = json.choices?.[0]?.delta?.content;
          if (token) onToken(token);
        } catch { /* ignore malformed chunks */ }
      }
    }
  }
}

async function streamClaude(systemPrompt, messages, signal, onToken) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      stream: true,
      system: systemPrompt,
      messages,
    }),
    signal,
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let partial   = '';

  while (true) {
    if (signal?.aborted) break;
    const { done, value } = await reader.read();
    if (done) break;
    partial += decoder.decode(value, { stream: true });

    const lines = partial.split('\n');
    partial = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      try {
        const json = JSON.parse(trimmed.slice(6));
        if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
          onToken(json.delta.text);
        }
      } catch { /* ignore malformed chunks */ }
    }
  }
}

// ── Sentence-streaming pipeline ──────────────────────────────────────────────
// Streams LLM tokens, detects sentence boundaries, fires each sentence to TTS
// immediately — first audio begins ~600ms faster than waiting for full reply.
//
// Returns the complete reply text when both streaming and TTS are done.

// heardRef is an array passed by reference — we push each sentence into it
// as soon as TTS finishes playing it, so callers know what was heard on barge-in.
async function streamLLMAndSpeak(systemPrompt, messages, signal, ws, streamSid, heardRef = []) {
  let tokenBuffer = ''; // accumulates streamed tokens
  let fullReply   = '';
  const sentenceQueue = [];
  let ttsRunning  = false;
  let drainPromise = Promise.resolve();

  // Regex: sentence ends at .!? followed by whitespace or end-of-string,
  // but NOT after common honorifics (Dr, Mr, Mrs, Ms, St, vs) which Deepgram
  // TTS would otherwise split into their own utterances ("Let me check Dr." pause "Smith").
  const SENTENCE_END = /(?<!\b(?:Dr|Mr|Mrs|Ms|St|vs|etc))[.!?]+(?=\s|$)/;

  function drainQueue() {
    if (ttsRunning) return; // already draining
    ttsRunning = true;
    drainPromise = (async () => {
      while (sentenceQueue.length > 0) {
        if (signal?.aborted) break;
        const raw = sentenceQueue.shift();
        // Strip BOOKING_DATA marker so it never reaches TTS — it's a data
        // payload for server-side parsing, not spoken text.
        const sentence = raw.replace(/\[BOOKING_DATA:.*?\]/s, '').trim();
        if (!sentence) continue;
        console.log(`[TTS→] "${sentence}"`);
        await speakToTwilio(sentence, ws, streamSid, signal);
        // Only mark as heard if the signal wasn't aborted mid-playback
        if (!signal?.aborted) heardRef.push(sentence);
      }
      ttsRunning = false;
    })();
  }

  function flushTokenBuffer(forceFlush = false) {
    // Pull complete sentences out of the buffer and enqueue them.
    let match;
    while ((match = SENTENCE_END.exec(tokenBuffer)) !== null) {
      const boundaryEnd = match.index + match[0].length;
      const sentence    = tokenBuffer.slice(0, boundaryEnd).trim();
      tokenBuffer       = tokenBuffer.slice(boundaryEnd).trimStart();
      if (sentence) {
        sentenceQueue.push(sentence);
        drainQueue();
      }
    }
    // At end-of-stream, flush whatever remains (e.g. a sentence without punctuation)
    if (forceFlush && tokenBuffer.trim()) {
      sentenceQueue.push(tokenBuffer.trim());
      tokenBuffer = '';
      drainQueue();
    }
  }

  function onToken(token) {
    tokenBuffer += token;
    fullReply   += token;
    flushTokenBuffer(false);
  }

  // Stream from the active LLM
  if (USE_GROQ) {
    console.log('[LLM] Streaming via Groq (testing mode)');
    await streamGroq(systemPrompt, messages, signal, onToken);
  } else {
    console.log('[LLM] Streaming via Claude Haiku');
    await streamClaude(systemPrompt, messages, signal, onToken);
  }

  // Flush any trailing text after the stream closes
  flushTokenBuffer(true);

  // Wait for the TTS queue to drain completely
  await drainPromise;
  // drainPromise only covers the last drain cycle; if new sentences were added
  // after the last cycle ended, we spin until truly empty.
  while (ttsRunning || sentenceQueue.length > 0) {
    if (signal?.aborted) break;
    await new Promise((r) => setTimeout(r, 20));
  }

  return fullReply.trim();
}

// Generate a post-call summary for SMS notification
async function generateCallSummary(businessName, messages) {
  if (!messages.length) return null;
  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'Caller' : 'AI'}: ${m.content}`)
    .join('\n');
  const summarySystem = 'Summarise this dental office call in one short sentence. Note if an appointment or callback was requested. Be brief.';
  try {
    if (USE_GROQ) {
      return await callGroq(summarySystem, [{ role: 'user', content: transcript }]);
    }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        system: summarySystem,
        messages: [{ role: 'user', content: transcript }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

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

// ============================================================================
// Deepgram TTS → Twilio media frames (mulaw 8kHz, 160-byte/frame)
// Returns when audio is fully sent OR when abortSignal is triggered (barge-in)
// ============================================================================
const FRAME_SIZE = 160; // 20ms of mulaw 8kHz audio

async function speakToTwilio(text, ws, streamSid, signal) {
  if (!text || !streamSid || ws.readyState !== WebSocket.OPEN) return;

  const res = await fetch(
    'https://api.deepgram.com/v1/speak?model=aura-asteria-en&encoding=mulaw&sample_rate=8000&container=none',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      signal,
    }
  );

  if (!res.ok || !res.body) {
    console.error('[Deepgram TTS]', res.status, await res.text().catch(() => ''));
    return;
  }

  // Lead-in silence: prime Twilio's jitter buffer before real audio arrives.
  // Without this, the first syllable of each TTS chunk gets clipped (Twilio
  // drops frames until its buffer stabilises). 3 frames = 60ms — enough to
  // prevent clipping without adding noticeable latency.
  const SILENCE_LEAD_FRAMES = 3;
  const silenceFrame = Buffer.alloc(FRAME_SIZE, 0xff); // mulaw silence = 0xFF
  for (let i = 0; i < SILENCE_LEAD_FRAMES; i++) {
    if (signal?.aborted || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ event: 'media', streamSid, media: { payload: silenceFrame.toString('base64') } }));
  }

  let buffer = Buffer.alloc(0);
  const reader = res.body.getReader();
  // Pre-buffer: send the first PRE_BUFFER_FRAMES frames without delay so Twilio
  // has a small cushion against Node.js event-loop jitter. After that, pace at
  // real-time (20ms/frame) to keep the buffer shallow for responsive barge-in.
  // 15 frames = 300ms buffer — small enough that clear still stops audio quickly.
  const PRE_BUFFER_FRAMES = 15;
  let framesSent = 0;

  try {
    while (true) {
      if (signal?.aborted) break;
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      buffer = Buffer.concat([buffer, Buffer.from(value)]);

      while (buffer.length >= FRAME_SIZE) {
        if (signal?.aborted || ws.readyState !== WebSocket.OPEN) return;
        const frame = buffer.subarray(0, FRAME_SIZE);
        buffer = buffer.subarray(FRAME_SIZE);
        ws.send(
          JSON.stringify({
            event: 'media',
            streamSid,
            media: { payload: frame.toString('base64') },
          })
        );
        framesSent++;
        if (framesSent > PRE_BUFFER_FRAMES) {
          // Real-time pacing after pre-buffer is established
          await new Promise((r) => setTimeout(r, FRAME_SIZE / 8)); // 20ms
        }
      }
    }
  } catch (e) {
    if (e.name !== 'AbortError') console.error('[Deepgram TTS stream]', e.message);
    return;
  }

  // Flush remainder
  if (!signal?.aborted && buffer.length > 0 && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        event: 'media',
        streamSid,
        media: { payload: buffer.toString('base64') },
      })
    );
  }
}

// ============================================================================
// Twilio fallback webhook (Next.js handles the real one)
// ============================================================================
app.post('/incoming-call', express.json(), (req, res) => {
  const railwayUrl = process.env.RAILWAY_URL || 'wss://localhost:8080';
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Connect>
        <Stream url="${railwayUrl}/media-stream" />
      </Connect>
    </Response>`;
  res.type('text/xml');
  res.send(twiml);
});

// ============================================================================
// Media Stream WebSocket — main AI pipeline
// ============================================================================
app.ws('/media-stream', async (ws, req) => {
  console.log('[Twilio] New Media Stream connection');

  const url = new URL(req.url, 'http://localhost');
  const conversationId = url.searchParams.get('conversationId');
  const businessIdParam = url.searchParams.get('businessId');
  console.log(`[Call] Raw URL: ${req.url}`);
  console.log(`[Call] Params — conversationId: ${conversationId}, businessId: ${businessIdParam}`);

  // Per-call state
  let streamSid        = null;
  let business         = null;
  let systemPrompt     = '';
  const messages       = [];   // { role, content }[]
  let callerPhone      = null;
  let dgSocket         = null;
  let isSpeaking       = false;
  let pendingTranscript = '';
  let abortController  = null; // for barge-in cancellation
  let cleanedUp        = false;
  let turnId           = 0;    // increments each AI turn; guards stale finally blocks
  let heardSentences   = [];   // sentences the caller actually heard before any barge-in
  let keepAliveTimer   = null; // periodic mark event to prevent Twilio WebSocket idle drop
  let silenceTimer     = null; // auto-disconnect after SILENCE_TIMEOUT_MS of no user speech
  let bookingState     = { stage: 'idle', name: null, phone: null, dob: null, reason: null, providerPreference: null, availableSlots: [], chosenSlot: null, patientId: null };

  const SILENCE_TIMEOUT_MS = 20_000;

  function resetSilenceTimer() {
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(async () => {
      if (cleanedUp) return;
      console.log('[Silence] No speech for 15s — ending call');
      // Abort any in-progress AI speech, then say a brief goodbye
      if (abortController) { abortController.abort(); }
      if (ws.readyState === WebSocket.OPEN && streamSid) {
        ws.send(JSON.stringify({ event: 'clear', streamSid }));
        const farewell = `It looks like you may have stepped away. Feel free to call us back anytime. Goodbye.`;
        await speakToTwilio(farewell, ws, streamSid, new AbortController().signal);
      }
      await handleCallEnd();
      ws.close();
    }, SILENCE_TIMEOUT_MS);
  }

  // Load business config — try businessId directly first (fastest, most reliable),
  // fall back to conversationId lookup for phone calls via incoming-call webhook.
  try {
    if (businessIdParam && businessIdParam !== 'undefined') {
      const biz = await supabaseRequest(`businesses?id=eq.${businessIdParam}&select=*`);
      business = biz?.[0] || null;
      console.log(business ? `[Call] Business (direct): ${business.name}` : `[Call] No business for id ${businessIdParam}`);
    }
    if (!business && conversationId && conversationId !== 'undefined') {
      business = await getBusinessByConversationId(conversationId);
      console.log(business ? `[Call] Business (via conv): ${business.name}` : `[Call] No business for conversation ${conversationId}`);
    }
    if (business) systemPrompt = buildSystemPrompt(business);
  } catch (e) {
    console.error('[Supabase load]', e.message);
  }

  // ------------------------------------------------------------------
  // Deepgram streaming STT setup
  // ------------------------------------------------------------------
  function setupDeepgram() {
    const params = new URLSearchParams({
      encoding: 'mulaw',
      sample_rate: '8000',
      channels: '1',
      model: 'nova-2-phonecall',
      interim_results: 'true',
      vad_events: 'true',       // enables SpeechStarted event — required for instant barge-in
      endpointing: '200',       // was 300 — tighter end-of-turn detection
      utterance_end_ms: '1000', // fire UtteranceEnd after 1s of silence as fallback
      smart_format: 'true',
      language: 'en-US',
    });

    dgSocket = new WebSocket(`wss://api.deepgram.com/v1/listen?${params}`, {
      headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` },
    });

    dgSocket.on('open',  () => console.log('[Deepgram] Connected'));
    dgSocket.on('error', (e) => console.error('[Deepgram]', e.message));
    dgSocket.on('close', () => {
      console.log('[Deepgram] Closed');
      // If the Deepgram socket drops mid-call (network blip), reconnect so STT keeps working.
      // Without this the call stays connected but the AI goes deaf — no more transcripts.
      if (!cleanedUp) {
        console.log('[Deepgram] Reconnecting...');
        setTimeout(() => { if (!cleanedUp) setupDeepgram(); }, 500);
      }
    });

    dgSocket.on('message', async (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        // ── Fix 1: Abort on SpeechStarted (VAD fires ~50ms after speech begins,
        //   before any transcript exists). This is what makes barge-in feel instant.
        if (data.type === 'SpeechStarted') {
          resetSilenceTimer(); // user is speaking — reset the idle countdown
          if (isSpeaking && abortController) {
            console.log('[Barge-in] SpeechStarted — stopping AI immediately');
            abortController.abort();
            isSpeaking = false;
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ event: 'clear', streamSid }));
            }
          }
          return;
        }

        // UtteranceEnd fires after utterance_end_ms of silence — treat as speech_final
        // so we don't drop the last utterance if the caller trails off without endpointing
        if (data.type === 'UtteranceEnd') {
          if (pendingTranscript) {
            const userText = pendingTranscript;
            pendingTranscript = '';
            await processTurn(userText);
          }
          return;
        }

        if (data.type !== 'Results') return;

        const transcript = data.channel?.alternatives?.[0]?.transcript || '';
        if (!transcript || !data.is_final) return;

        pendingTranscript = (pendingTranscript + ' ' + transcript).trim();
        if (!data.speech_final) return;

        const userText = pendingTranscript;
        pendingTranscript = '';
        if (!userText) return;

        await processTurn(userText);
      } catch (e) {
        console.error('[Deepgram parse]', e.message);
      }
    });
  }

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
      if (bookingState.stage === 'idle' &&
          (business?.opendental_booking_mode === 'collect_only' ||
           (business?.opendental_api_key && business?.opendental_server_url))) {
        const isBooking = await detectBookingIntent(userText);
        if (isBooking) {
          bookingState.stage = 'collecting';
          console.log('[Booking] Intent detected — entering collection stage');
        }
      }

      // ── Extract BOOKING_DATA marker from previous assistant message ───────
      if (bookingState.stage === 'collecting') {
        const lastAssistant = messages.filter((m) => m.role === 'assistant').pop();
        if (lastAssistant) {
          const match = lastAssistant.content.match(/\[BOOKING_DATA:(\{.*?\})\]/s);
          if (match) {
            try {
              const data = JSON.parse(match[1]);
              bookingState.name               = data.name     || bookingState.name;
              bookingState.phone              = data.phone    || bookingState.phone;
              bookingState.dob                = data.dob      || bookingState.dob;
              bookingState.reason             = data.reason   || bookingState.reason;
              bookingState.providerPreference = data.provider || null;
              // Strip marker from stored message so it doesn't affect LLM context
              lastAssistant.content = lastAssistant.content.replace(/\[BOOKING_DATA:.*?\]/s, '').trim();
              console.log('[Booking] Collected all fields:', bookingState);
            } catch { /* malformed marker — keep collecting */ }
          }
        }

        const allCollected = bookingState.name && bookingState.phone && bookingState.dob && bookingState.reason;

        if (allCollected) {
          const mode = business?.opendental_booking_mode || 'autonomous';
          const hasOD = business?.opendental_api_key && business?.opendental_server_url;

          if (!hasOD || mode === 'collect_only') {
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

          // Hardcoded bridge — speak before the async fetch so the LLM never
          // needs to generate filler words like "pause" or "one moment" itself.
          const checkingMsg = `Let me check our schedule for you, one moment.`;
          await speakToTwilio(checkingMsg, ws, streamSid, mySignal);
          messages.push({ role: 'assistant', content: checkingMsg });
          if (conversationId) saveMessage(conversationId, 'assistant', checkingMsg).catch(() => {});

          try {
            const slots = await getAvailability(
              business.opendental_server_url,
              business.opendental_api_key,
              {
                windowDays: business.opendental_booking_window || 7,
                providerName: bookingState.providerPreference || null,
                timeZone: business.timezone || 'America/New_York',
              }
            );
            if (!slots.length) throw new Error('No slots returned');
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

      // ── Extract slot choice from caller response ──────────────────────────
      if (bookingState.stage === 'checking') {
        const chosen = await extractSlotChoice(userText, bookingState.availableSlots);
        if (chosen) {
          bookingState.chosenSlot = chosen;
          bookingState.stage = 'confirming';
          console.log('[Booking] Caller chose slot:', chosen);
        }
      }

      // ── Handle yes/no confirmation ────────────────────────────────────────
      if (bookingState.stage === 'confirming') {
        const confirmed = /\b(yes|yeah|yep|sure|confirm|go ahead|book it|that works|perfect|great)\b/i.test(userText);
        const declined  = /\b(no|nope|cancel|don't|different|another|change)\b/i.test(userText);

        if (confirmed && bookingState.chosenSlot) {
          try {
            let patient = await findPatient(
              business.opendental_server_url,
              business.opendental_api_key,
              { name: bookingState.name, dob: bookingState.dob }
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

            if (conversationId) {
              supabaseRequest(`conversations?id=eq.${conversationId}`, {
                method: 'PATCH',
                body: JSON.stringify({ appointment_id: String(apt.AptNum), appointment_requested: true }),
                headers: { Prefer: 'return=minimal' },
              }).catch(() => {});
            }

            if (business.phone_number) {
              const smsMode = mode === 'pending' ? '(pending confirmation)' : '(confirmed)';
              sendSms(business.phone_number, business.twilio_sid,
                `Appointment booked via AI ${smsMode} — ${bookingState.name}, ${s.date} at ${s.time} with ${s.provider}, reason: ${bookingState.reason}`
              ).catch(() => {});
            }

            const confirmMsg = mode === 'autonomous'
              ? `You're all booked. ${bookingState.name}, we have you down for ${s.date} at ${s.time} with ${s.provider}. Is there anything else I can help you with?`
              : `I've submitted your appointment request for ${s.date} at ${s.time} with ${s.provider}. Our team will confirm it with you shortly. Is there anything else I can help you with?`;

            await speakToTwilio(confirmMsg, ws, streamSid, mySignal);
            messages.push({ role: 'assistant', content: confirmMsg });
            if (conversationId) saveMessage(conversationId, 'assistant', confirmMsg).catch(() => {});
            isSpeaking = false;
            return;

          } catch (e) {
            console.error('[Booking] createAppointment failed:', e.code, e.message);
            if (e.code === 'SLOT_TAKEN') {
              try {
                const newSlots = await getAvailability(
                  business.opendental_server_url,
                  business.opendental_api_key,
                  { windowDays: business.opendental_booking_window || 7, timeZone: business.timezone || 'America/New_York' }
                );
                if (!newSlots.length) throw new Error('No slots on retry');
                bookingState.availableSlots = newSlots;
                bookingState.stage = 'checking';
                bookingState.chosenSlot = null;
                const retryMsg = `It looks like that slot just filled up. Let me find you the next available time.`;
                await speakToTwilio(retryMsg, ws, streamSid, mySignal);
                messages.push({ role: 'assistant', content: retryMsg });
                if (conversationId) saveMessage(conversationId, 'assistant', retryMsg).catch(() => {});
                isSpeaking = false;
                return;
              } catch {
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

      // Strip BOOKING_DATA marker before storing (will be parsed on the NEXT turn)
      const cleanReply = reply.replace(/\[BOOKING_DATA:.*?\]/s, '').trim();
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

  // ------------------------------------------------------------------
  // Initial greeting
  // ------------------------------------------------------------------
  async function sendGreeting() {
    if (!streamSid) return;
    const greeting = business?.ai_greeting
      ? business.ai_greeting
      : `Hi, thank you for calling ${business?.name || 'our office'}. I'm ${business?.ai_name || 'Claire'}. How can I help you today?`;

    isSpeaking = true;
    heardSentences = [];
    // Push greeting BEFORE the first await so it's always in messages before
    // any other event (speech_final, SpeechStarted) can fire and push a user message.
    messages.push({ role: 'assistant', content: greeting });
    if (conversationId) {
      saveMessage(conversationId, 'assistant', greeting).catch(() => {});
    }
    abortController = new AbortController();
    const greetingTurn = ++turnId;
    try {
      console.log(`[AI] ${greeting}`);
      await speakToTwilio(greeting, ws, streamSid, abortController.signal);
    } catch (e) {
      if (e.name !== 'AbortError') console.error('[Greeting]', e.message);
    } finally {
      if (greetingTurn === turnId) {
        isSpeaking = false;
        abortController = null;
      }
      resetSilenceTimer(); // start idle countdown once greeting is done
    }
  }

  // ------------------------------------------------------------------
  // Post-call cleanup: summary + SMS
  // ------------------------------------------------------------------
  async function handleCallEnd() {
    if (cleanedUp) return;
    cleanedUp = true;

    if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null; }
    if (silenceTimer)   { clearTimeout(silenceTimer);   silenceTimer   = null; }
    if (dgSocket) dgSocket.close();

    // Abort any in-progress TTS
    if (abortController) abortController.abort();

    const userMessages = messages.filter((m) => m.role === 'user');
    if (!userMessages.length) {
      if (conversationId) endConversation(conversationId).catch(() => {});
      return;
    }

    // Generate summary and send SMS notification to practice owner
    let summary = null;
    try {
      summary = await generateCallSummary(business?.name || 'Practice', messages);
      console.log(`[Summary] ${summary}`);
    } catch (e) {
      console.error('[Summary]', e.message);
    }

    if (conversationId) {
      endConversation(conversationId, summary).catch((e) =>
        console.error('[DB end]', e.message)
      );
    }

    // SMS the practice owner if they have a phone number configured
    const ownerPhone   = business?.phone_number;
    const twilioNumber = business?.twilio_sid;
    if (ownerPhone && twilioNumber && summary) {
      const smsBody = `📞 New call${callerPhone ? ` from ${callerPhone}` : ''}\n${summary}`;
      sendSms(ownerPhone, twilioNumber, smsBody).catch((e) =>
        console.error('[SMS]', e.message)
      );
    }
  }

  // ------------------------------------------------------------------
  // Twilio WebSocket message handler
  // ------------------------------------------------------------------
  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.event === 'start') {
        streamSid   = msg.start?.streamSid || msg.streamSid;
        callerPhone = msg.start?.customParameters?.callerPhone || null;
        console.log(`[Twilio] Call started: ${streamSid}`);
        setupDeepgram();
        setTimeout(() => sendGreeting(), 300);
        // Send a Twilio mark event every 10s to prevent WebSocket idle disconnection
        // during long silences (e.g. caller is thinking, AI finished speaking).
        keepAliveTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN && streamSid) {
            ws.send(JSON.stringify({ event: 'mark', streamSid, mark: { name: 'keepalive' } }));
          }
        }, 10_000);
        return;
      }

      if (msg.event === 'media' && msg.media?.payload) {
        // Always forward audio to Deepgram — even while speaking, so barge-in works.
        // Deepgram will detect the caller's voice and we abort the current TTS.
        if (dgSocket?.readyState === WebSocket.OPEN) {
          dgSocket.send(Buffer.from(msg.media.payload, 'base64'));
        }
        return;
      }

      if (msg.event === 'stop') {
        console.log('[Twilio] Call ended');
        await handleCallEnd();
        ws.close();
      }
    } catch (e) {
      console.error('[Twilio msg]', e.message);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Closed');
    handleCallEnd().catch(() => {});
  });

  ws.on('error', (e) => console.error('[WebSocket]', e.message));
});

// ============================================================================
// Health check
// ============================================================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🎤 Voice AI server running on port ${PORT}`);
});
