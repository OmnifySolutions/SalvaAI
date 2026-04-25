"use client";

import VoiceCard from "./VoiceCard";

type VoiceTone = "sarah" | "emma" | "james" | "marcus";

const VOICES: { key: VoiceTone; name: string; gender: "Female" | "Male"; tone: string; desc: string }[] = [
  { key: "sarah",  name: "Sarah",  gender: "Female", tone: "Warm & Friendly",          desc: "Approachable and caring. Perfect for pediatric and family dental." },
  { key: "emma",   name: "Emma",   gender: "Female", tone: "Clinical & Precise",        desc: "Clear and efficient. Ideal for oral surgery and specialist practices." },
  { key: "james",  name: "James",  gender: "Male",   tone: "Professional & Efficient",  desc: "Confident and direct. Great for busy front desk energy." },
  { key: "marcus", name: "Marcus", gender: "Male",   tone: "Warm & Approachable",       desc: "Friendly and calm. Builds strong patient rapport." },
];

export default function AudioDemo() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 border-t border-gray-100">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          Hear it in action
        </div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
          Sounds like your best team member.
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          No robotic voices. No confusing menus. Just natural, intelligent conversation that patients trust.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {VOICES.map((voice) => (
          <VoiceCard key={voice.key} voice={voice} />
        ))}
      </div>
    </div>
  );
}
