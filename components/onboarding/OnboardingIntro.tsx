"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, User } from "lucide-react";

const INTRO_TEXT = "Hi, I'm your new AI receptionist. Let's get you set up — it only takes a few minutes.";

type Props = { onContinue: () => void };

export default function OnboardingIntro({ onContinue }: Props) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptIdx, setTranscriptIdx] = useState(0);
  const [ctaReady, setCtaReady] = useState(false);
  const [started, setStarted] = useState(false);

  const words = INTRO_TEXT.split(" ");

  // Use browser speech synthesis (guaranteed to work, no auth required)
  function start() {
    if (started) return;
    setStarted(true);

    const speak = () => {
      // Clear any pending speech
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(INTRO_TEXT);
      u.rate = 0.95;
      u.pitch = 1.0;

      // Get available voices and prefer a natural-sounding one
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferred = voices.find((v) => /Samantha|Google US English|Microsoft Zira|Karen/i.test(v.name));
        if (preferred) u.voice = preferred;
        else u.voice = voices[0]; // Fallback to first available voice
      }

      u.onstart = () => {
        console.log("Speech started");
        setIsSpeaking(true);
      };
      u.onend = () => {
        console.log("Speech ended");
        setIsSpeaking(false);
        setCtaReady(true);
      };
      u.onerror = (e) => {
        console.log("Speech error:", e.error);
        setIsSpeaking(false);
        setCtaReady(true);
      };

      window.speechSynthesis.speak(u);
    };

    // Voices might not be loaded yet; retry with onvoiceschanged
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speak();
    } else {
      const handler = () => speak();
      window.speechSynthesis.onvoiceschanged = handler;
      // Also try immediately in case voices load asynchronously
      setTimeout(speak, 200);
    }
  }

  // Auto-start on first mount (user initiated by visiting the page — modern browsers allow autoplay with muted, so we also support click)
  useEffect(() => {
    const timer = setTimeout(() => start(), 300);
    // Guarantee CTA appears after 8 seconds even if audio fails
    const ctaTimer = setTimeout(() => setCtaReady(true), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(ctaTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typewriter effect synced roughly to speech duration (~5 seconds)
  useEffect(() => {
    if (!started) return;
    const msPerWord = 280;
    const interval = setInterval(() => {
      setTranscriptIdx((i) => {
        if (i >= words.length) {
          clearInterval(interval);
          return i;
        }
        return i + 1;
      });
    }, msPerWord);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden" style={{ fontFamily: "var(--font-geist-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)" }}>
      {/* ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      {/* skip */}
      <button
        onClick={onContinue}
        className="absolute top-6 right-8 text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
      >
        Skip intro →
      </button>

      <div className="relative z-10 flex flex-col items-center max-w-2xl px-8">
        {/* Avatar */}
        <div className="relative mb-12">
          {/* outer glow ring */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500 via-rose-500 to-blue-500 blur-2xl transition-all duration-700 ${
              isSpeaking ? "scale-125 opacity-60" : "scale-100 opacity-30"
            }`}
          />
          {/* concentric pulse rings when speaking */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full border border-white/20 animate-ping-slow" />
              <div className="absolute inset-0 rounded-full border border-white/10 animate-ping-slower" />
            </>
          )}
          {/* avatar core */}
          <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 border border-white/10 flex items-center justify-center shadow-2xl">
            <User size={80} className="text-slate-300" strokeWidth={1} />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500/20 to-rose-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-orange-400/30 flex items-center gap-2 whitespace-nowrap">
            <Sparkles size={12} className="text-orange-300 shrink-0" />
            <span className="text-xs font-semibold text-white">Your AI</span>
          </div>
        </div>

        {/* Transcript */}
        <div className="text-center min-h-[5rem] mb-12">
          <p className="text-2xl md:text-3xl font-black leading-relaxed">
            {words.slice(0, transcriptIdx).map((word, i) => (
              <span
                key={i}
                className={`transition-colors duration-200 ${
                  i === transcriptIdx - 1 ? "text-orange-400" : "text-white"
                }`}
              >
                {word}{" "}
              </span>
            ))}
            <span className={`inline-block w-0.5 h-6 ml-1 bg-orange-400 ${transcriptIdx < words.length ? "animate-pulse" : "opacity-0"}`} />
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onContinue}
          className={`group relative bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-4 rounded-full font-semibold text-sm tracking-wide shadow-2xl shadow-orange-500/30 transition-all ${
            ctaReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
          disabled={!ctaReady}
        >
          <span className="relative z-10">Begin setup →</span>
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        </button>

        <p className="text-xs text-slate-500 mt-6 tracking-widest uppercase">Takes ~3 minutes</p>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { height: 0.75rem; }
          50% { height: 3.5rem; }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        :global(.animate-wave) { animation: wave 1.1s ease-in-out infinite; }
        :global(.animate-ping-slow) { animation: ping-slow 1.8s cubic-bezier(0,0,0.2,1) infinite; }
        :global(.animate-ping-slower) { animation: ping-slower 2.4s cubic-bezier(0,0,0.2,1) infinite; }
      `}</style>
    </div>
  );
}
