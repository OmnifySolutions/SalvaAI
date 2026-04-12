import express from 'express';
import expressWs from 'express-ws';
import { createClient as createDeepgramClient } from '@deepgram/sdk';
import { Anthropic } from '@anthropic-ai/sdk';

const app = express();
expressWs(app);

const PORT = process.env.PORT || 8080;

const deepgramClient = createDeepgramClient({
  apiKey: process.env.DEEPGRAM_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Incoming webhook from Twilio (tells us a call is coming)
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

// WebSocket endpoint for Twilio Media Streams
app.ws('/media-stream', (ws, req) => {
  console.log('New Media Stream connection from Twilio');

  let deepgramLive = null;
  let conversationHistory = [];
  let callSid = null;
  let streamConnected = false;

  // Initialize Deepgram live transcription
  async function initDeepgram() {
    try {
      deepgramLive = await deepgramClient.listen.live({
        model: 'nova-2-general',
        language: 'en',
        interim_results: false,
        encoding: 'mulaw',
        sample_rate: 8000,
        vad: true,
      });

      deepgramLive.on('open', () => {
        console.log('[Deepgram] Connected');
        streamConnected = true;
      });

      deepgramLive.on('transcriptReceived', async (result) => {
        try {
          const transcript = result.channel.alternatives[0]?.transcript?.trim();

          if (!transcript || result.is_final === false) {
            return;
          }

          console.log(`[Caller] ${transcript}`);

          conversationHistory.push({
            role: 'user',
            content: transcript,
          });

          // Get Claude response
          const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 100,
            system:
              'You are a friendly dental office receptionist AI. Answer naturally and concisely in under 30 words. Be helpful and warm.',
            messages: conversationHistory,
          });

          const botMessage = response.content[0].type === 'text' ? response.content[0].text : '';

          console.log(`[AI] ${botMessage}`);

          conversationHistory.push({
            role: 'assistant',
            content: botMessage,
          });

          // TODO: Convert to speech and stream back
          // For now, just log it. ElevenLabs audio streaming requires proper mulaw encoding.
        } catch (error) {
          console.error('[Claude] Error:', error.message);
        }
      });

      deepgramLive.on('error', (error) => {
        console.error('[Deepgram] Error:', error);
      });

      deepgramLive.on('close', () => {
        console.log('[Deepgram] Connection closed');
      });
    } catch (error) {
      console.error('[Deepgram] Failed to initialize:', error);
    }
  }

  // Handle Twilio messages
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);

      if (message.event === 'connected') {
        console.log('[Twilio] Connected');
        await initDeepgram();
      }

      if (message.event === 'start') {
        callSid = message.start.streamSid;
        console.log(`[Twilio] Call started: ${callSid}`);
      }

      // Incoming audio from caller (mulaw, 8kHz)
      if (message.event === 'media' && message.media?.payload) {
        if (deepgramLive && streamConnected) {
          const audioBuffer = Buffer.from(message.media.payload, 'base64');
          deepgramLive.send(audioBuffer);
        }
      }

      if (message.event === 'stop') {
        console.log('[Twilio] Call stopped');
        if (deepgramLive) {
          deepgramLive.finish();
        }
        ws.close();
      }
    } catch (error) {
      console.error('[WebSocket] Message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Closed');
    if (deepgramLive) {
      deepgramLive.finish();
    }
  });

  ws.on('error', (error) => {
    console.error('[WebSocket] Error:', error);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🎤 Voice AI server running on port ${PORT}`);
});
