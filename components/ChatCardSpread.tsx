"use client";

import { useCarousel } from "@/hooks/useCarousel";

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
  {
    label: "Pricing",
    messages: [
      { role: "user", text: "How much does Invisalign cost?" },
      { role: "ai",   text: "Invisalign starts at $3,800 — we also offer 0% financing over 18 months. Want to book a free consult?" },
      { role: "user", text: "Yes, that sounds perfect!" },
    ],
  },
];

const N = scenarios.length;
const VISIBLE = 2;
const items = [...scenarios, ...scenarios.slice(0, VISIBLE)];

const CARD_W = 248;
const GAP = 16;
const CONTAINER_W = CARD_W * VISIBLE + GAP * (VISIBLE - 1);
const STEP = CARD_W + GAP;
const TRACK_W = items.length * CARD_W + (items.length - 1) * GAP;

export default function ChatCardSpread() {
  const { position, animate, jumpTo } = useCarousel(N);
  const activeIndex = position % N;

  return (
    <div className="select-none mx-auto" style={{ width: CONTAINER_W }}>
      <div className="overflow-hidden rounded-2xl" style={{ height: 380 }}>
        <div
          style={{
            display: "flex",
            width: TRACK_W,
            transform: `translateX(${-position * STEP}px)`,
            transition: animate ? "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            height: "100%",
          }}
        >
          {items.map((scenario, i) => (
            <div
              key={i}
              style={{ width: CARD_W, flexShrink: 0, marginRight: GAP, height: "100%" }}
            >
              <ChatCard scenario={scenario} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-5">
        {scenarios.map((_, i) => (
          <button
            key={i}
            onClick={() => jumpTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              activeIndex === i ? "bg-gray-700 w-4" : "bg-gray-300 w-1.5"
            }`}
            aria-label={`Show scenario ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ChatCard({ scenario }: { scenario: (typeof scenarios)[number] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/80 overflow-hidden h-full flex flex-col">
      <div className="bg-gray-900 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
          AI
        </div>
        <div>
          <div className="text-white text-sm font-medium">Smile Dental Group</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
            Online now
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 bg-gray-50 overflow-hidden">
        {scenario.messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`text-sm px-3.5 py-2.5 rounded-2xl max-w-[90%] leading-relaxed ${
                msg.role === "user"
                  ? "bg-gray-900 text-white rounded-br-sm"
                  : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-400">
          Type a message...
        </div>
        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3.5 h-3.5">
            <path d="M3.105 3.105a.75.75 0 0 1 .919-.11l13.5 7.5a.75.75 0 0 1 0 1.31l-13.5 7.5a.75.75 0 0 1-1.05-.949l1.9-4.75a.75.75 0 0 0 0-.612l-1.9-4.75a.75.75 0 0 1 .131-.639Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
