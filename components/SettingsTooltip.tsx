"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const STORAGE_KEY = "salvaai_settings_tooltip_seen";

export default function SettingsTooltip({ justOnboarded }: { justOnboarded: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!justOnboarded) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, [justOnboarded]);

  function dismiss() {
    setVisible(false);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "1");
  }

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-6 z-50 max-w-xs animate-slide-in">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow-2xl p-5 border border-white/10 relative">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-orange-400" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-orange-400">Quick tip</span>
        </div>
        <p className="text-sm font-semibold mb-2">Finish configuring your AI in Settings</p>
        <p className="text-xs text-slate-400 mb-4">
          Add Do&apos;s &amp; Don&apos;ts, enable features, and fine-tune your AI&apos;s personality.
        </p>
        <div className="flex gap-2">
          <a
            href="/settings"
            onClick={dismiss}
            className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold px-4 py-2 rounded-full text-center hover:opacity-90 transition-opacity"
          >
            Open Settings
          </a>
          <button
            onClick={dismiss}
            className="text-xs text-slate-400 hover:text-white px-3 py-2 transition-colors"
          >
            Later
          </button>
        </div>
        {/* arrow pointing to nav */}
        <div className="absolute -top-2 right-10 w-4 h-4 bg-slate-900 rotate-45 border-t border-l border-white/10" />
      </div>
      <style jsx>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        :global(.animate-slide-in) { animation: slide-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
      `}</style>
    </div>
  );
}
