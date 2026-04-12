"use client";

const bubbles = [
  { text: "Do you accept Delta Dental?",          x: "4%",  y: "12%", delay: "0s",   duration: "9s",   rotate: "-3deg", scale: 0.95 },
  { text: "What are your Saturday hours?",         x: "58%", y: "5%",  delay: "1.5s", duration: "11s",  rotate: "2deg",  scale: 0.9  },
  { text: "Can I book a cleaning online?",         x: "70%", y: "55%", delay: "3s",   duration: "10s",  rotate: "-2deg", scale: 1.0  },
  { text: "Is Dr. Smith taking new patients?",     x: "2%",  y: "60%", delay: "2s",   duration: "12s",  rotate: "3deg",  scale: 0.88 },
  { text: "How much is teeth whitening?",          x: "52%", y: "78%", delay: "4.5s", duration: "9.5s", rotate: "-4deg", scale: 0.92 },
  { text: "Do you offer payment plans?",           x: "16%", y: "82%", delay: "0.8s", duration: "13s",  rotate: "1deg",  scale: 0.97 },
  { text: "Do you do emergency appointments?",     x: "35%", y: "3%",  delay: "3.5s", duration: "10.5s",rotate: "2deg",  scale: 0.85 },
  { text: "What insurance do you accept?",         x: "78%", y: "28%", delay: "5s",   duration: "11.5s",rotate: "-1deg", scale: 0.93 },
];

export default function FloatingBubbles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: b.x,
            top: b.y,
            animationName: "float-up",
            animationDuration: b.duration,
            animationDelay: b.delay,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            ["--r" as string]: b.rotate,
          }}
        >
          <div
            className="bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl shadow-md whitespace-nowrap"
            style={{
              transform: `scale(${b.scale}) rotate(${b.rotate})`,
              opacity: 0.72,
            }}
          >
            {b.text}
          </div>
        </div>
      ))}
    </div>
  );
}
