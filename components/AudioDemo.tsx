"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const scenarios = [
  {
    id: "new-patient",
    label: "New patient inquiry",
    description: "A first-time caller asking about scheduling and what to expect.",
    src: "/audio/demo-new-patient.mp3",
  },
  {
    id: "after-hours",
    label: "After-hours call",
    description: "A patient calls at 10pm with an urgent question — AI handles it calmly.",
    src: "/audio/demo-after-hours.mp3",
  },
  {
    id: "insurance",
    label: "Insurance question",
    description: "Patient asks about accepted plans and out-of-pocket costs.",
    src: "/audio/demo-insurance.mp3",
  },
];

export default function AudioDemo() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const refs = useRef<Record<string, HTMLAudioElement | null>>({});

  function toggle(id: string) {
    const audio = refs.current[id];
    if (!audio) return;

    if (playing === id) {
      audio.pause();
      setPlaying(null);
    } else {
      // Pause any currently playing
      if (playing && refs.current[playing]) {
        refs.current[playing]!.pause();
      }
      audio.play();
      setPlaying(id);
    }
  }

  function handleTimeUpdate(id: string) {
    const audio = refs.current[id];
    if (!audio || !audio.duration) return;
    setProgress((p) => ({ ...p, [id]: audio.currentTime / audio.duration }));
  }

  function handleEnded(id: string) {
    setPlaying(null);
    setProgress((p) => ({ ...p, [id]: 0 }));
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
          Hear it for yourself
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Real AI conversations — the same voice your patients will hear when they call.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {scenarios.map((s) => {
          const isPlaying = playing === s.id;
          const pct = (progress[s.id] ?? 0) * 100;

          return (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <audio
                ref={(el) => { if (el) refs.current[s.id] = el; }}
                onTimeUpdate={() => handleTimeUpdate(s.id)}
                onEnded={() => handleEnded(s.id)}
                preload="auto"
                src={s.src}
              />

              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.label}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.description}</p>
                </div>
                <button
                  onClick={() => toggle(s.id)}
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isPlaying
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-900 text-white hover:bg-gray-700"
                  }`}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause size={16} strokeWidth={2} />
                  ) : (
                    <Play size={16} strokeWidth={2} className="translate-x-px" />
                  )}
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-100"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
