"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Play } from "lucide-react";

const INTRO_TEXT = "Hi, I'm your new AI receptionist. Let's get you set up — it only takes a few minutes.";
const WORDS = INTRO_TEXT.split(" ");

type Props = { onContinue: () => void };

function ReceptionistAvatar() {
  return (
    <video
      src="/audio/onboarding/avatar-idle.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover object-top"
    />
  );
}

export default function OnboardingIntro({ onContinue }: Props) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptIdx, setTranscriptIdx] = useState(0);
  const [highlightActive, setHighlightActive] = useState(false);
  const [ctaReady, setCtaReady] = useState(false);
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // derived: highlight current word while typing, cleared 1s after last word
  const activeWordIdx = highlightActive ? transcriptIdx - 1 : -1;

  function start() {
    if (started) return;
    setStarted(true);
    ctaTimerRef.current = setTimeout(() => setCtaReady(true), 8000);
    if (!audioRef.current) return;
    audioRef.current.play().catch(() => fallbackToSpeechSynthesis());
  }

  function fallbackToSpeechSynthesis() {
    const speak = () => {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(INTRO_TEXT);
      u.rate = 0.95;
      u.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferred = voices.find((v) => /Samantha|Google US English|Microsoft Zira|Karen/i.test(v.name));
        if (preferred) u.voice = preferred;
        else u.voice = voices[0];
      }
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => { setIsSpeaking(false); setCtaReady(true); };
      u.onerror = () => { setIsSpeaking(false); setCtaReady(true); };
      window.speechSynthesis.speak(u);
    };
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) speak();
    else { window.speechSynthesis.onvoiceschanged = speak; setTimeout(speak, 200); }
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => setIsSpeaking(true);
    const handleEnded = () => { setIsSpeaking(false); setCtaReady(true); };
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("ended", handleEnded);
      if (ctaTimerRef.current) clearTimeout(ctaTimerRef.current);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Typewriter: last word reverts to white after 1s
  useEffect(() => {
    if (!isSpeaking) return;
    setTranscriptIdx(0);
    setHighlightActive(true);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setTranscriptIdx(idx);
      if (idx >= WORDS.length) {
        clearInterval(interval);
        setTimeout(() => setHighlightActive(false), 1000);
      }
    }, 280);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden"
      style={{ fontFamily: "var(--font-geist-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)" }}
    >
      <audio ref={audioRef} src="/audio/onboarding/ai-intro.mp3" preload="auto" />

      {/* Animated ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl animate-orb-1" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl animate-orb-2" />

      {/* Skip */}
      <button
        onClick={onContinue}
        className="absolute top-6 right-8 text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-colors z-10"
      >
        Skip intro →
      </button>

      <div className="relative z-10 flex flex-col items-center justify-center gap-10 max-w-2xl w-full px-8">
        {/* Avatar */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500 via-rose-500 to-blue-500 blur-2xl transition-all duration-700 ${
            isSpeaking ? "scale-125 opacity-60" : started ? "scale-100 opacity-20" : "scale-100 opacity-30"
          }`} />
          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full border border-white/20 animate-ping-slow" />
              <div className="absolute inset-0 rounded-full border border-white/10 animate-ping-slower" />
            </>
          )}
          <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 border border-white/10 shadow-2xl overflow-hidden">
            <ReceptionistAvatar />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500/20 to-rose-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-orange-400/30 flex items-center gap-2 whitespace-nowrap">
            <Sparkles size={12} className="text-orange-300 shrink-0" />
            <span className="text-xs font-semibold text-white">Your AI Receptionist</span>
          </div>
        </div>

        {/* Transcript */}
        <div className="flex items-center justify-center w-full min-h-[6rem] text-center">
          {started && (
            <p className="text-2xl md:text-3xl font-black leading-relaxed">
              {WORDS.slice(0, transcriptIdx).map((word, i) => (
                <span
                  key={i}
                  className={`transition-colors duration-300 ${i === activeWordIdx ? "text-orange-400" : "text-white"}`}
                >
                  {word}{" "}
                </span>
              ))}
              <span className={`inline-block w-0.5 h-6 ml-1 bg-orange-400 ${transcriptIdx < WORDS.length ? "animate-pulse" : "opacity-0"}`} />
            </p>
          )}
        </div>

        {/* Start / CTA */}
        <div className="flex flex-col items-center gap-5">
          {!started ? (
            <div className="relative flex items-center justify-center p-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 blur-xl opacity-50 animate-ping-slow" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 blur-2xl opacity-30 animate-ping-slower" />
              <button
                onClick={start}
                className="relative group bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-4 rounded-full font-semibold text-sm tracking-wide shadow-2xl shadow-orange-500/30 hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <Play size={16} />
                Start
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            </div>
          ) : (
            <button
              onClick={onContinue}
              className={`group relative bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-4 rounded-full font-semibold text-sm tracking-wide shadow-2xl shadow-orange-500/30 transition-all duration-500 ${
                ctaReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
              }`}
              disabled={!ctaReady}
            >
              <span className="relative z-10">Begin setup →</span>
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>
          )}
          <p className="text-xs text-slate-500 tracking-widest uppercase">Takes ~3 minutes</p>
        </div>
      </div>

      <style jsx>{`
        /* Orb drift */
        @keyframes orb-drift-1 {
          0%   { transform: translate(0, 0); }
          33%  { transform: translate(35vw, 20vh); }
          66%  { transform: translate(5vw, 40vh); }
          100% { transform: translate(0, 0); }
        }
        @keyframes orb-drift-2 {
          0%   { transform: translate(0, 0); }
          33%  { transform: translate(-28vw, -25vh); }
          66%  { transform: translate(-42vw, 12vh); }
          100% { transform: translate(0, 0); }
        }
        :global(.animate-orb-1) { animation: orb-drift-1 28s ease-in-out infinite; }
        :global(.animate-orb-2) { animation: orb-drift-2 34s ease-in-out infinite; }

        /* Head idle tilt */
        @keyframes idle-tilt {
          0%, 100% { transform: rotate(0deg); }
          30%  { transform: rotate(-2deg); }
          70%  { transform: rotate(2deg); }
        }
        /* Head speaking bob */
        @keyframes speaking-bob {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25%  { transform: rotate(-1.5deg) translateY(-1px); }
          75%  { transform: rotate(1.5deg) translateY(1px); }
        }
        /* Hair swaying */
        @keyframes hair-sway {
          0%, 100% { transform: rotate(-3deg) scale(1.05); }
          50%  { transform: rotate(3deg) scale(1.05); }
        }
        :global(.avatar-idle)     { animation: idle-tilt 5s ease-in-out infinite; transform-origin: center 90%; }
        :global(.avatar-speaking) { animation: speaking-bob 0.55s ease-in-out infinite; transform-origin: center 90%; }
        :global(.animate-hair-sway) { animation: hair-sway 6s ease-in-out infinite; transform-origin: center 80%; }

        /* Lip sync */
        @keyframes lip-cavity {
          from { transform: scaleY(0.05); }
          to   { transform: scaleY(1); }
        }
        @keyframes lower-lip-drop {
          from { transform: translateY(0px); }
          to   { transform: translateY(4px); }
        }
        @keyframes teeth-show {
          from { opacity: 0.3; }
          to   { opacity: 1; }
        }
        :global(.mouth-cavity) { transform-box: fill-box; transform-origin: center; }
        :global(.mouth-idle .mouth-cavity)     { transform: scaleY(0); }
        :global(.mouth-speaking .mouth-cavity) { animation: lip-cavity 0.22s ease-in-out infinite alternate; }
        :global(.lower-lip)                    { transform-box: fill-box; transform-origin: top center; }
        :global(.mouth-speaking .lower-lip)    { animation: lower-lip-drop 0.22s ease-in-out infinite alternate; }
        :global(.mouth-idle .teeth)            { opacity: 0.6; }
        :global(.mouth-speaking .teeth)        { animation: teeth-show 0.22s ease-in-out infinite alternate; }

        /* Ping rings */
        @keyframes ping-slow {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes ping-slower {
          0%   { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        :global(.animate-ping-slow)   { animation: ping-slow 1.8s cubic-bezier(0,0,0.2,1) infinite; }
        :global(.animate-ping-slower) { animation: ping-slower 2.4s cubic-bezier(0,0,0.2,1) infinite; }
      `}</style>
    </div>
  );
}
