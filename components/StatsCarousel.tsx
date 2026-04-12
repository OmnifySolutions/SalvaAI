"use client";

import { useState, useEffect } from "react";

const stats = [
  { number: "35%",      label: "of dental calls go unanswered" },
  { number: "78%",      label: "hang up when they reach voicemail" },
  { number: "65%",      label: "of missed calls are potential new patients" },
  { number: "$8,000",   label: "lifetime value of a new patient" },
  { number: "$150,000", label: "lost annually from missed calls" },
];

const N = stats.length; // 5
const VISIBLE = 3;
// Duplicate first VISIBLE items at end for seamless loop
const items = [...stats, ...stats.slice(0, VISIBLE)];

const CARD_W = 252;
const GAP = 16;
const CONTAINER_W = CARD_W * VISIBLE + GAP * (VISIBLE - 1); // 788px
const STEP = CARD_W + GAP; // 268px per step

export default function StatsCarousel() {
  const [position, setPosition] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setAnimate(true);
      setPosition((p) => p + 1);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  // Snap back after reaching the cloned section
  useEffect(() => {
    if (position === N) {
      const timeout = setTimeout(() => {
        setAnimate(false);
        setPosition(0);
        setTimeout(() => setAnimate(true), 50);
      }, 650);
      return () => clearTimeout(timeout);
    }
  }, [position]);

  return (
    <div style={{ width: CONTAINER_W, margin: "0 auto" }}>
      <div
        className="overflow-hidden"
        style={{ width: CONTAINER_W }}
      >
        <div
          style={{
            display: "flex",
            width: items.length * STEP,
            transform: `translateX(${-position * STEP}px)`,
            transition: animate
              ? "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
          }}
        >
          {items.map((stat, i) => (
            <div
              key={i}
              style={{
                width: CARD_W,
                flexShrink: 0,
                marginRight: GAP,
              }}
              className="text-center py-6"
            >
              <div className="text-3xl font-bold text-gray-900 tracking-tight">
                {stat.number}
              </div>
              <div className="text-sm text-gray-500 mt-1.5 leading-snug max-w-[180px] mx-auto">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
