"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Square } from "lucide-react";

export function AudioDemoPlayer({ s, playing, setPlaying }: any) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const isPlaying = playing === s.id;

  // If another track was played globally, ensure we pause and rewind ourselves securely
  useEffect(() => {
    if (!isPlaying && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setProgress(0);
    }
  }, [isPlaying]);

  const handleToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setPlaying(null);
    } else {
      // Synchronous play to satisfy iOS/Safari strict user gesture requirements
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlaying(s.id);
          })
          .catch((err) => {
            console.error("Audio playback failed:", err);
            setPlaying(null);
          });
      } else {
        setPlaying(s.id);
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
      {/* Hidden robust native audio tag */}
      <audio
        ref={audioRef}
        src={s.src}
        preload="metadata"
        onTimeUpdate={(e) => {
          const target = e.currentTarget;
          if (target.duration) {
            setProgress((target.currentTime / target.duration) * 100);
          }
        }}
        onEnded={() => {
          setPlaying(null);
          setProgress(0);
        }}
        className="hidden"
      />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-gray-900 mb-1">{s.label}</h3>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
            {s.duration}
          </span>
        </div>
        <button
          onClick={handleToggle}
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

      <p className="text-sm text-gray-500 mb-6 line-clamp-2">{s.description}</p>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative">
        <div
          className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
