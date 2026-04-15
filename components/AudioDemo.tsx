"use client";

import { useState, useRef } from "react";
import { Play, Square } from "lucide-react";

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
  const [playing, setPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const handlePlayPause = (id: string) => {
    // Pause any other playing audio natively
    Object.keys(audioRefs.current).forEach((key) => {
      const audioEl = audioRefs.current[key];
      if (key !== id && audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    });

    const targetEl = audioRefs.current[id];
    if (!targetEl) return;

    if (playing === id) {
      targetEl.pause();
      setPlaying(null);
    } else {
      setPlaying(id);
      // Synchronous direct play call so iOS/Safari does not reject the Promise
      targetEl.play().catch(e => {
        console.warn("Autoplay blocked. Consider trying again after interaction.", e);
        setPlaying(null);
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-24 border-t border-gray-100">
      <div className="text-center mb-16">
        <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-4 inline-block">
          Hear it in action
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
          Sounds like your best team member.
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          No robotic voices. No confusing menus. Just natural, intelligent conversation that patients trust.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((s) => {
          const isPlaying = playing === s.id;
          const currentProgress = progress[s.id] || 0;

          return (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <audio
                src={s.src}
                ref={(el) => { audioRefs.current[s.id] = el; }}
                preload="metadata"
                // Listeners right on the React element
                onTimeUpdate={(e) => {
                  const target = e.currentTarget;
                  if (target.duration) {
                    setProgress((prev) => ({ ...prev, [s.id]: (target.currentTime / target.duration) * 100 }));
                  }
                }}
                onEnded={() => {
                  setPlaying(null);
                  setProgress((prev) => ({ ...prev, [s.id]: 0 }));
                }}
              />

              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.label}</h3>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                    {s.duration}
                  </span>
                </div>
                <button
                  onClick={() => handlePlayPause(s.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm ${
                    isPlaying
                      ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                  }`}
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                >
                  {isPlaying ? (
                    <Square size={20} className="fill-current" />
                  ) : (
                    <Play size={20} className="ml-1 fill-current" />
                  )}
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                {s.description}
              </p>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-100"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
