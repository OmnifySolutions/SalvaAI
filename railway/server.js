import express from 'express';
import expressWs from 'express-ws';
import WebSocket from 'ws';

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

  return `You are ${business.ai_name || 'Claire'}, the AI receptionist for ${business.name}.

You are answering a live phone call. Be warm, natural, and concise — like a real receptionist, not a chatbot. Never use lists, bullet points, or any formatting. Your words will be spoken aloud by text-to-speech, so write exactly as you would speak.

Keep responses to one or two sentences. Give longer answers only when a caller asks a detailed question.

Practice information:
- Name: ${business.name}
- Hours: ${hoursText || 'See website for current hours'}
- Services: ${servicesText || 'General dental care'}
${business.custom_prompt ? `\nAdditional instructions:\n${business.custom_prompt}` : ''}
${faqText ? `\nFrequently asked questions:\n${faqText}` : ''}

Guidelines:
- Never discuss clinical or medical specifics — say you'll have a team member call back.
- If someone wants to schedule an appointment or be called back, get their name and confirm you'll pass it to the office.
- If you don't know something, offer to have the office follow up.
- Do not volunteer that you are an AI unless directly asked.`;
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
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

  // Regex: sentence ends at .!? followed by whitespace or end-of-string.
  // We intentionally keep it simple — the LLM is prompted to write short,
  // plain spoken sentences with no abbreviations or lists.
  const SENTENCE_END = /[.!?]+(?=\s|$)/;

  function drainQueue() {
    if (ttsRunning) return; // already draining
    ttsRunning = true;
    drainPromise = (async () => {
      while (sentenceQueue.length > 0) {
        if (signal?.aborted) break;
        const sentence = sentenceQueue.shift();
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

  let buffer = Buffer.alloc(0);
  const reader = res.body.getReader();

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
        // Real-time pacing: each frame is 20ms of audio.
        // Sending at this rate keeps Twilio's buffer shallow (~1 frame deep)
        // so a barge-in 'clear' event cuts audio within one frame (~20ms).
        await new Promise((r) => setTimeout(r, FRAME_SIZE / 8)); // 160 bytes / 8kHz = 20ms
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

  // Load business config before Twilio start event arrives
  if (conversationId) {
    try {
      business = await getBusinessByConversationId(conversationId);
      if (business) {
        systemPrompt = buildSystemPrompt(business);
        console.log(`[Call] Business: ${business.name}`);
      } else {
        console.warn('[Call] No business for conversation', conversationId);
      }
    } catch (e) {
      console.error('[Supabase]', e.message);
    }
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
    dgSocket.on('close', () => console.log('[Deepgram] Closed'));

    dgSocket.on('message', async (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        // ── Fix 1: Abort on SpeechStarted (VAD fires ~50ms after speech begins,
        //   before any transcript exists). This is what makes barge-in feel instant.
        if (data.type === 'SpeechStarted') {
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
    if (isSpeaking) return; // SpeechStarted already cleared this; bail if still racing
    isSpeaking = true;

    console.log(`[User] ${userText}`);

    // ── Fix 3+4: Build accurate message history based on what was actually heard.
    // If barge-in fired mid-response, heardSentences contains only the sentences
    // that fully played before the caller interrupted. We push only those to
    // messages (not the full reply), so the LLM knows exactly what the caller heard.
    if (heardSentences.length > 0) {
      const heardText = heardSentences.join(' ');
      messages.push({ role: 'assistant', content: heardText });
      if (conversationId) {
        saveMessage(conversationId, 'assistant', heardText).catch(() => {});
      }
      heardSentences = [];
    }

    // Annotate the user message if we know it's an interruption mid-thought
    // (i.e., there was a prior AI turn that was cut off — we already handled
    // the partial heard content above, so just save the user text normally)
    messages.push({ role: 'user', content: userText });
    if (conversationId) {
      saveMessage(conversationId, 'user', userText).catch((e) =>
        console.error('[DB save]', e.message)
      );
    }

    heardSentences = []; // reset for this new turn
    abortController = new AbortController();
    const myTurn = ++turnId;
    try {
      const reply = await streamLLMAndSpeak(
        systemPrompt, messages, abortController.signal, ws, streamSid, heardSentences
      );
      if (!reply || abortController.signal.aborted) return;

      // Full reply completed without interruption — push the whole canonical reply.
      // heardSentences was being populated by streamLLMAndSpeak; discard it since
      // we're using the full reply text instead (avoids double-push on next turn).
      console.log(`[AI] ${reply}`);
      heardSentences = [];
      messages.push({ role: 'assistant', content: reply });
      if (conversationId) {
        saveMessage(conversationId, 'assistant', reply).catch((e) =>
          console.error('[DB save]', e.message)
        );
      }
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
    heardSentences = []; // reset before greeting
    abortController = new AbortController();
    const greetingTurn = ++turnId;
    try {
      console.log(`[AI] ${greeting}`);
      await speakToTwilio(greeting, ws, streamSid, abortController.signal);
      // Only commit greeting to history + heardSentences if fully played
      if (!abortController.signal.aborted) {
        messages.push({ role: 'assistant', content: greeting });
        heardSentences.push(greeting);
        if (conversationId) {
          saveMessage(conversationId, 'assistant', greeting).catch(() => {});
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.error('[Greeting]', e.message);
    } finally {
      if (greetingTurn === turnId) {
        isSpeaking = false;
        abortController = null;
      }
    }
  }

  // ------------------------------------------------------------------
  // Post-call cleanup: summary + SMS
  // ------------------------------------------------------------------
  async function handleCallEnd() {
    if (cleanedUp) return;
    cleanedUp = true;

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
