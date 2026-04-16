"use client";

import React from "react";

const scenarios = [
  {
    label: "Insurance",
    messages: [
      { role: "user", text: "Do you accept Delta Dental insurance?" },
      { role: "ai",   text: "Yes! We're in-network with Delta Dental, Cigna, and Aetna. Want to schedule a new patient exam?" },
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
      { role: "ai",   text: "New patient exams with X-rays and cleaning start at $149, often covered by insurance. Shall I check availability?" },
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
      <div className="absolute inset-y-0 left-0 w-[220px] bg-gradient-to-r from-[#fafafa] via-[#fafafa]/90 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-[220px] bg-gradient-to-l from-[#fafafa] via-[#fafafa]/90 to-transparent z-20 pointer-events-none" />
      
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/50 overflow-hidden h-full flex flex-col">
      <div className="bg-gray-900 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
          AI
        </div>
        <div>
          <div className="text-white text-sm font-medium">Salva AI</div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium tracking-wide">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
            ONLINE NOW
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 bg-gray-50 overflow-hidden">
        {scenario.messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`text-[13px] px-4 py-3 rounded-2xl max-w-[85%] leading-relaxed ${
                msg.role === "user"
                  ? "bg-gray-900 text-white rounded-br-sm shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-[13px] text-gray-400" aria-hidden="true">
          Type a message...
        </div>
        <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4">
            <path d="M3.105 3.105a.75.75 0 0 1 .919-.11l13.5 7.5a.75.75 0 0 1 0 1.31l-13.5 7.5a.75.75 0 0 1-1.05-.949l1.9-4.75a.75.75 0 0 0 0-.612l-1.9-4.75a.75.75 0 0 1 .131-.639Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
