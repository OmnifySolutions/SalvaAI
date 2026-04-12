# HustleClaude Voice AI — Railway WebSocket Server

This is the Twilio Media Streams WebSocket server that handles real-time voice conversations.

## What It Does

1. Receives audio stream from Twilio (mulaw format, 8kHz)
2. Sends to Deepgram for real-time speech-to-text
3. Sends transcript to Claude Haiku for response
4. Converts response to speech via ElevenLabs
5. Streams audio back to the caller

## Deployment to Railway

### 1. Connect Your Repo
```bash
# In Railway dashboard, create a new project
# Link it to your GitHub repo: OmnifySolutions/HustleClaude
```

### 2. Add Environment Variables
In the Railway dashboard, add these variables to the voice service:

```
ANTHROPIC_API_KEY=sk-ant-...
DEEPGRAM_API_KEY=77eed...
ELEVENLABS_API_KEY=sk_f15ad...
ELEVENLABS_VOICE_ID=WZlYpi...
```

### 3. Configure Root Path
In Railway settings, set:
- **Root Directory:** `railway`

### 4. Deploy
Push to main branch — Railway auto-deploys.

### 5. Get Your Railway URL
After deployment, Railway assigns you a URL like:
```
https://hustleclaude-voice-production.up.railway.app
```

Update `.env.local` in the main Next.js app:
```
RAILWAY_URL=wss://hustleclaude-voice-production.up.railway.app
```

(Change `https` to `wss` for WebSocket)

### 6. Configure Twilio Webhook
In Twilio console, set the incoming call webhook to:
```
https://your-vercel-app.vercel.app/api/voice/incoming-call
```

## Local Development

```bash
cd railway
npm install
npm run dev
```

Server runs on `http://localhost:8080` with hot reload.

## Monitoring

Check Railway logs in the dashboard to see:
- Connection events (`New Media Stream connection`)
- Transcripts (`User: ...`)
- Claude responses (`Assistant: ...`)
- Any errors

## Costs

- Railway: ~$6/month (flat, includes up to 500 hours/month)
- Deepgram: ~$0.0059/min (included in request budget)
- Claude: ~$0.001 per request
- ElevenLabs: ~$7-10/customer/month (depends on usage)
