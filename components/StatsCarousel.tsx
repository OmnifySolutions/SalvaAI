"use client";

import React from "react";

const stats = [
  { number: "Fully",       label: "customizable name, voice & FAQs" },
  { number: "5 Min",      label: "setup time to go live with your own AI" },
  { number: "24/7",       label: "after-hours inquiries handled automatically" },
  { number: "24/7",       label: "booking & insurance sync with Open Dental" },
  { number: "Free",        label: "start with 50 interactions, no card needed" },
];

const duplicatedStats = [...stats, ...stats, ...stats]; // Enough to fill out the width
const trackItems = [...duplicatedStats, ...duplicatedStats];

export default function StatsCarousel() {
  return (
    <div className="w-full overflow-hidden relative border-y border-gray-100 bg-white py-6">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white via-white/40 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white via-white/40 to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee-reverse hover:[animation-play-state:paused]">
        {trackItems.map((stat, i) => (
          <div
            key={i}
            className="w-[300px] shrink-0 mr-10 text-center flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm rounded-[24px] py-7 border border-white/60 transition-all hover:bg-white/80 hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="text-3xl font-black bg-gradient-to-br from-gray-900 to-gray-500 bg-clip-text text-transparent tracking-tighter">
              {stat.number}
            </div>
            <div className="text-[12px] text-gray-400 mt-3 font-bold uppercase tracking-wider max-w-[200px] leading-tight">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
