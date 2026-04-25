"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Square } from "lucide-react";

type VoiceTone = "sarah" | "emma" | "james" | "marcus";

interface Voice {
  key: VoiceTone;
  name: string;
  gender: "Female" | "Male";
  tone: string;
  desc: string;
}

const WAVEFORM_HEIGHTS = [6, 16, 28, 38, 40, 34, 22, 38, 40, 28, 14, 32, 40, 24, 38, 12, 30, 40, 22, 36, 16, 40, 28, 14, 36, 40, 20, 10];
const WAVEFORM_DURATIONS = [0.7, 0.55, 0.9, 0.6, 0.75, 0.5, 1.0, 0.65, 0.8, 0.55, 0.7, 0.9, 0.5, 0.75, 0.6, 0.85, 0.5, 0.7, 0.95, 0.6, 0.8, 0.5, 0.7, 0.9, 0.55, 0.75, 0.6, 0.85];

function VoiceWaveform({ name }: { name: string }) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-2">
      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{name} · Previewing</span>
      <div className="flex items-end gap-[2.5px] h-7">
        {WAVEFORM_HEIGHTS.map((maxH, i) => (
          <div
            key={i}
            className="flex-1 rounded-full animate-waveform"
            style={{
              background: `linear-gradient(to top, #2563eb, #60a5fa)`,
              minWidth: '3px',
              maxWidth: '8px',
              ['--wave-min' as string]: '3px',
              ['--wave-max' as string]: `${maxH}px`,
              animationDuration: `${WAVEFORM_DURATIONS[i]}s`,
              animationDelay: `${(i * 0.055) % 0.7}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function VoiceCard({ voice }: { voice: Voice }) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  function stopPreview() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    setPlayingVoice(null);
  }

  function handlePreview() {
    if (playingVoice === voice.key) {
      stopPreview();
      return;
    }
    stopPreview();
    setPlayingVoice(voice.key);
    const audio = new Audio(`/voices/${voice.key}.mp3`);
    audioRef.current = audio;
    audio.addEventListener("ended", stopPreview);
    audio.play().catch(() => {
      // File not yet added — waveform animation still plays, audio fails silently
    });
    // 15s safety cap in case audio is long or stalls
    previewTimerRef.current = setTimeout(stopPreview, 15000);
  }

  const isPreviewing = playingVoice === voice.key;

  return (
    <div
      className={`cursor-pointer w-full rounded-xl border transition-colors duration-150 select-none bg-white border-gray-200 h-[96px]`}
    >
      {isPreviewing ? (
        <div className="px-5 h-full flex items-center gap-3">
          <button
            type="button"
            onClick={handlePreview}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Square size={12} className="text-white" fill="white" />
          </button>
          <VoiceWaveform name={voice.name} />
        </div>
      ) : (
        <div className="flex items-center gap-4 px-5 h-full">
          <button
            type="button"
            onClick={handlePreview}
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all bg-gray-100 hover:bg-gray-200`}
          >
            <Play size={13} className="text-gray-500" fill="currentColor" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-sm tracking-tight text-gray-900">{voice.name}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${voice.gender === "Female" ? 'bg-pink-50 text-pink-500' : 'bg-sky-50 text-sky-500'}`}>
                {voice.gender}
              </span>
              <span className="text-[10px] font-semibold text-gray-400">{voice.tone}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{voice.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
