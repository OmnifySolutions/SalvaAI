// One-time script to generate the onboarding intro MP3 via ElevenLabs.
// Run with: node scripts/generate-intro-audio.mjs
// Output: public/audio/onboarding-intro.mp3

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Load .env.local manually
const envPath = path.join(root, ".env.local");
const envRaw = fs.readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envRaw
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const API_KEY = env.ELEVENLABS_API_KEY;
// Allow override via CLI arg; default to Rachel (free tier default voice)
const VOICE_ID = process.argv[2] || "21m00Tcm4TlvDq8ikWAM";
if (!API_KEY || !VOICE_ID) {
  console.error("Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID in .env.local");
  process.exit(1);
}

const TEXT = "Hi, I'm your new AI receptionist. Let's get you set up — it only takes a few minutes.";

const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
  method: "POST",
  headers: {
    "xi-api-key": API_KEY,
    "Content-Type": "application/json",
    "Accept": "audio/mpeg",
  },
  body: JSON.stringify({
    text: TEXT,
    model_id: "eleven_turbo_v2_5",
    voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },
  }),
});

if (!res.ok) {
  const body = await res.text();
  console.error(`ElevenLabs error ${res.status}: ${body}`);
  process.exit(1);
}

const buf = Buffer.from(await res.arrayBuffer());
const outDir = path.join(root, "public", "audio");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "onboarding-intro.mp3");
fs.writeFileSync(outPath, buf);
console.log(`✓ Wrote ${outPath} (${buf.length} bytes)`);
