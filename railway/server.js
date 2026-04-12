import express from 'express';
import expressWs from 'express-ws';
import WebSocket from 'ws';

const app = express();
expressWs(app);

const PORT = process.env.PORT || 8080;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

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

async function endConversation(conversationId) {
  return supabaseRequest(`conversations?id=eq.${conversationId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'completed',
      ended_at: new Date().toISOString(),
    }),
    headers: { Prefer: 'return=minimal' },
  });
}

// ============================================================================
// System prompt builder (phone-optimized)
// ============================================================================
function buildSystemPrompt(business) {
  const hours =
    typeof business.hours === 'string'
      ? safeParse(business.hours)
      : business.hours || {};
  const services =
    typeof business.services === 'string'
      ? safeParse(business.services)
      : business.services || [];
  const faqs = business.faqs || [];

  const hoursText = Object.entries(hours)
    .filter(([, v]) => v?.enabled)
    .map(([day, v]) => `${day}: ${v.open}-${v.close}`)
    .join(', ');

  const servicesText = Array.isArray(services)
    ? services.map((s) => s.name || s).join(', ')
    : String(services || '');

  const faqText = faqs
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join('\n\n');

  return `You are ${business.ai_name || 'Claire'}, the AI receptionist for ${business.name}.

You are answering a phone call. Speak naturally and conversationally — like a real receptionist, not a chatbot. Never use lists, bullet points, markdown, or formatting of any kind. Your responses will be read aloud by a text-to-speech engine, so write in complete spoken sentences.

Keep responses SHORT — usually one to two sentences. Only give longer answers when directly asked a detailed question.

Practice info:
- Name: ${business.name}
- Hours: ${hoursText || 'See website'}
- Services: ${servicesText || 'General dental care'}

${business.custom_prompt ? `Additional instructions:\n${business.custom_prompt}\n` : ''}
${faqText ? `Frequently asked questions:\n${faqText}\n` : ''}

Rules:
- If asked anything clinical or medical, say you'll have a team member call back.
- If you don't know the answer, offer to take a message for the office to follow up.
- Sound warm, friendly, and professional. Never sound robotic.
- Do not mention that you are an AI unless asked directly.`;
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

// ============================================================================
// Claude (Anthropic API) — direct HTTP, no SDK
// ============================================================================
async function callClaude(systemPrompt, messages) {
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
  });
  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text?.trim() || '';
}

// ============================================================================
// ElevenLabs streaming TTS → Twilio media frames
// Twilio expects mulaw 8kHz, 20ms frames (160 bytes each), base64-encoded
// ============================================================================
const FRAME_SIZE = 160;

async function speakToTwilio(text, ws, streamSid) {
  if (!text || !streamSid || ws.readyState !== WebSocket.OPEN) return;

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream?output_format=ulaw_8000`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!res.ok || !res.body) {
    console.error('[ElevenLabs]', res.status, await res.text().catch(() => ''));
    return;
  }

  let buffer = Buffer.alloc(0);
  const reader = res.body.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    buffer = Buffer.concat([buffer, Buffer.from(value)]);

    while (buffer.length >= FRAME_SIZE) {
      const frame = buffer.subarray(0, FRAME_SIZE);
      buffer = buffer.subarray(FRAME_SIZE);

      if (ws.readyState !== WebSocket.OPEN) return;
      ws.send(
        JSON.stringify({
          event: 'media',
          streamSid,
          media: { payload: frame.toString('base64') },
        })
      );
    }
  }

  // Flush any remainder
  if (buffer.length > 0 && ws.readyState === WebSocket.OPEN) {
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
// Twilio webhook → TwiML (fallback; Next.js usually handles this)
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
// Media Stream WebSocket handler — the main pipeline
// ============================================================================
app.ws('/media-stream', async (ws, req) => {
  console.log('[Twilio] New Media Stream connection');

  const url = new URL(req.url, 'http://localhost');
  const conversationId = url.searchParams.get('conversationId');

  let streamSid = null;
  let business = null;
  let systemPrompt = '';
  const messages = [];

  let dgSocket = null;
  let isSpeaking = false;
  let pendingTranscript = '';

  // Load business config early (before Twilio start event arrives)
  if (conversationId) {
    try {
      business = await getBusinessByConversationId(conversationId);
      if (business) {
        systemPrompt = buildSystemPrompt(business);
        console.log(`[Call] Loaded business: ${business.name}`);
      } else {
        console.warn('[Call] No business found for conversation', conversationId);
      }
    } catch (e) {
      console.error('[Supabase] Load error:', e.message);
    }
  }

  function setupDeepgram() {
    const params = new URLSearchParams({
      encoding: 'mulaw',
      sample_rate: '8000',
      channels: '1',
      model: 'nova-2-phonecall',
      interim_results: 'true',
      endpointing: '300',
      smart_format: 'true',
      language: 'en-US',
    });

    dgSocket = new WebSocket(`wss://api.deepgram.com/v1/listen?${params}`, {
      headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` },
    });

    dgSocket.on('open', () => console.log('[Deepgram] Connected'));
    dgSocket.on('error', (e) => console.error('[Deepgram] Error:', e.message));
    dgSocket.on('close', () => console.log('[Deepgram] Closed'));

    dgSocket.on('message', async (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        if (data.type !== 'Results') return;

        const transcript = data.channel?.alternatives?.[0]?.transcript || '';
        if (!transcript || !data.is_final) return;

        pendingTranscript = (pendingTranscript + ' ' + transcript).trim();
        if (!data.speech_final) return;

        const userText = pendingTranscript;
        pendingTranscript = '';
        if (!userText || isSpeaking) return;

        console.log(`[User] ${userText}`);
        messages.push({ role: 'user', content: userText });
        if (conversationId) {
          saveMessage(conversationId, 'user', userText).catch((e) =>
            console.error('[DB]', e.message)
          );
        }

        isSpeaking = true;
        try {
          const reply = await callClaude(systemPrompt, messages);
          if (!reply) return;
          console.log(`[AI] ${reply}`);
          messages.push({ role: 'assistant', content: reply });
          if (conversationId) {
            saveMessage(conversationId, 'assistant', reply).catch((e) =>
              console.error('[DB]', e.message)
            );
          }
          await speakToTwilio(reply, ws, streamSid);
        } catch (e) {
          console.error('[AI] Error:', e.message);
        } finally {
          isSpeaking = false;
        }
      } catch (e) {
        console.error('[Deepgram] Parse error:', e.message);
      }
    });
  }

  async function sendGreeting() {
    if (!streamSid) return;
    const greeting = business?.ai_greeting
      ? business.ai_greeting
      : `Hi, thank you for calling ${business?.name || 'our office'}. I'm ${
          business?.ai_name || 'Claire'
        }. How can I help you today?`;

    isSpeaking = true;
    try {
      messages.push({ role: 'assistant', content: greeting });
      if (conversationId) {
        saveMessage(conversationId, 'assistant', greeting).catch((e) =>
          console.error('[DB]', e.message)
        );
      }
      console.log(`[AI] ${greeting}`);
      await speakToTwilio(greeting, ws, streamSid);
    } catch (e) {
      console.error('[Greeting] Error:', e.message);
    } finally {
      isSpeaking = false;
    }
  }

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.event === 'start') {
        streamSid = msg.start?.streamSid || msg.streamSid;
        console.log(`[Twilio] Call started: ${streamSid}`);
        setupDeepgram();
        // Give Deepgram a moment to connect, then greet
        setTimeout(() => sendGreeting(), 300);
        return;
      }

      if (msg.event === 'media' && msg.media?.payload) {
        // Don't feed Deepgram while bot is speaking (prevents echo triggers)
        if (isSpeaking) return;
        if (dgSocket && dgSocket.readyState === WebSocket.OPEN) {
          dgSocket.send(Buffer.from(msg.media.payload, 'base64'));
        }
        return;
      }

      if (msg.event === 'stop') {
        console.log('[Twilio] Call ended');
        if (dgSocket) dgSocket.close();
        if (conversationId) {
          endConversation(conversationId).catch((e) =>
            console.error('[DB]', e.message)
          );
        }
        ws.close();
      }
    } catch (e) {
      console.error('[Twilio] Message error:', e.message);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Closed');
    if (dgSocket) dgSocket.close();
  });

  ws.on('error', (e) => console.error('[WebSocket] Error:', e.message));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🎤 Voice AI server running on port ${PORT}`);
});
