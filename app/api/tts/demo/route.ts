import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await req.json();
  if (!text || typeof text !== "string" || text.length > 500) {
    return Response.json({ error: "Invalid text" }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  if (!apiKey) {
    return Response.json({ error: "TTS not configured" }, { status: 503 });
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("ElevenLabs TTS error:", res.status, errBody);
    return Response.json({ error: "TTS failed", status: res.status }, { status: 502 });
  }

  const buf = await res.arrayBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
