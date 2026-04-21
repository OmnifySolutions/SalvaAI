"use client";

import { useState } from "react";
import { AudioDemoPlayer } from "./AudioDemoPlayer";

const scenarios = [
  {
    id: "new-patient",
    label: "New Patient Booking",
    duration: "0:45",
    src: "/audio/demo-new-patient.mp3",
    description: "Listen to the AI gather patient details, check availability, and schedule a new patient appointment.",
  },
  {
    id: "insurance",
    label: "Insurance Verification",
    duration: "0:32",
    src: "/audio/demo-insurance.mp3",
    description: "The AI safely routes complex insurance queries to the billing team while collecting callback information.",
  },
  {
    id: "after-hours",
    label: "After-Hours Emergency",
    duration: "0:28",
    src: "/audio/demo-after-hours.mp3",
    description: "Hear how the AI handles urgent after-hours calls, providing emergency instructions immediately.",
  },
];

export default function AudioDemo() {
  const [playingId, setPlayingId] = useState<string | null>(null);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((s) => (
          <AudioDemoPlayer
            key={s.id}
            s={s}
            playing={playingId}
            setPlaying={setPlayingId}
          />
        ))}
      </div>
    </div>
  );
}
