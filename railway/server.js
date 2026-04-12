import express from 'express';
import expressWs from 'express-ws';

const app = express();
expressWs(app);

const PORT = process.env.PORT || 8080;

// Incoming webhook from Twilio
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
  console.log('[Twilio] New Media Stream connection');

  let callSid = null;
  let audioChunks = [];

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      if (message.event === 'connected') {
        console.log('[Twilio] Connected');
      }

      if (message.event === 'start') {
        callSid = message.start.streamSid;
        console.log(`[Twilio] Call started: ${callSid}`);
      }

      // Capture audio from caller
      if (message.event === 'media' && message.media?.payload) {
        audioChunks.push(message.media.payload);
        console.log(`[Audio] Received chunk: ${message.media.payload.length} bytes`);
      }

      if (message.event === 'stop') {
        console.log(`[Twilio] Call ended. Total audio chunks: ${audioChunks.length}`);
        ws.close();
      }
    } catch (error) {
      console.error('[Error]', error.message);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Closed');
  });

  ws.on('error', (error) => {
    console.error('[WebSocket Error]', error);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🎤 Voice AI server running on port ${PORT}`);
});
