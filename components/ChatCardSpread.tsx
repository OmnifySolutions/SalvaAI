"use client";

import React from "react";

const scenarios = [
  {
    label: "Insurance",
    messages: [
      { role: "user", text: "Do you accept my insurance?" },
      { role: "ai",   text: "Yes! We're in-network with most major PPO plans, including the ones you listed. Want to schedule a new patient exam?" },
      { role: "user", text: "Yes please, what times are available?" },
    ],
  },
  {
    label: "After-hours",
    messages: [
      { role: "user", text: "Hi, it's 9pm and I have a toothache. Can I book tomorrow?" },
      { role: "ai",   text: "So sorry to hear that! We open at 8am — I'd suggest calling first thing. Need the number?" },
      { role: "user", text: "Yes please, that would be great!" },
    ],
  },
  {
    label: "New patient",
    messages: [
      { role: "user", text: "How much is a teeth cleaning for a new patient?" },
      { role: "ai",   text: "New patient exams are typically covered by insurance — I can help get you scheduled. Shall I find an opening?" },
      { role: "user", text: "That sounds great, let's do it!" },
    ],
  },
];

// We restrict to 3 scenarios max
const activeScenarios = scenarios.slice(0, 3);
const duplicatedScenarios = [...activeScenarios, ...activeScenarios];
const trackItems = [...duplicatedScenarios, ...duplicatedScenarios]; // Total 12 items

export default function ChatCardSpread() {
  return (
    <div className="w-full max-w-[850px] mx-auto overflow-hidden select-none relative group mt-10" style={{ height: 380 }}>
      {/* Background matches #fafafa so fade-out doesn't create hard cutoffs */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#fafafa] via-[#fafafa]/50 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#fafafa] via-[#fafafa]/50 to-transparent z-20 pointer-events-none" />
      
      <div className="flex animate-marquee h-full hover:[animation-play-state:paused] whitespace-nowrap overflow-visible items-center">
        {trackItems.map((scenario, i) => (
          <div
            key={i}
            className="w-[300px] shrink-0 mr-6 h-full transition-transform duration-300 hover:scale-[1.02] whitespace-normal"
          >
            <ChatCard scenario={scenario} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatCard({ scenario }: { scenario: (typeof scenarios)[number] }) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_30px_70px_rgba(0,0,0,0.06)] overflow-hidden h-full flex flex-col transition-all hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 group/card">
      {/* Premium Glass Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100 flex items-center gap-4 shrink-0">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-xl shadow-blue-500/20 group-hover/card:scale-110 transition-transform">
          AI
        </div>
        <div>
          <div className="text-[14px] font-black text-gray-900 tracking-tight">{scenario.label}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Live Channel</span>
          </div>
        </div>
      </div>

      {/* Modern Chat Feed */}
      <div className="flex-1 p-6 space-y-5 bg-gradient-to-b from-gray-50/50 to-white overflow-hidden">
        {scenario.messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`text-[13px] px-5 py-3.5 rounded-3xl max-w-[85%] leading-relaxed shadow-sm ring-1 ring-black/5 ${
                msg.role === "user"
                  ? "bg-gray-900 text-white rounded-br-sm"
                  : "bg-white text-gray-700 rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Refined Input Mock */}
      <div className="px-6 py-5 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0">
        <div className="flex-1 bg-gray-50/80 rounded-2xl px-5 py-3 text-[13px] text-gray-400 font-medium border border-gray-100" aria-hidden="true">
          Type a message...
        </div>
        <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-5 h-5">
            <path d="M3.105 3.105a.75.75 0 0 1 .919-.11l13.5 7.5a.75.75 0 0 1 0 1.31l-13.5 7.5a.75.75 0 0 1-1.05-.949l1.9-4.75a.75.75 0 0 0 0-.612l-1.9-4.75a.75.75 0 0 1 .131-.639Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
