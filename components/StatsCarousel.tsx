"use client";

import React from "react";

const stats = [
  { number: "Most",        label: "new-patient calls go unanswered during peak hours" },
  { number: "Few callers", label: "leave voicemail — the rest simply hang up" },
  { number: "Top reason",  label: "patients don't return: their first call went unanswered" },
  { number: "High value",  label: "lifetime revenue represented by each new dental patient" },
  { number: "24/7",        label: "coverage means zero missed opportunities, even at 11pm" },
];

const duplicatedStats = [...stats, ...stats, ...stats]; // Enough to fill out the width
const trackItems = [...duplicatedStats, ...duplicatedStats];

export default function StatsCarousel() {
  return (
    <div className="w-full overflow-hidden relative border-y border-gray-100 bg-white py-6">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

      <div className="flex animate-marquee-reverse hover:[animation-play-state:paused]">
        {trackItems.map((stat, i) => (
          <div
            key={i}
            className="w-[280px] shrink-0 mr-8 text-center flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl py-5 border border-gray-100 transition-colors hover:bg-gray-50"
          >
            <div className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent tracking-tight">
              {stat.number}
            </div>
            <div className="text-[13px] text-gray-500 mt-2 font-medium leading-snug max-w-[180px]">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
