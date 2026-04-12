"use client";

const bubbles = [
  { text: "Do you accept Delta Dental?", x: "4%",  y: "12%", delay: "0s",    duration: "9s",  rotate: "-3deg", scale: 0.9 },
  { text: "What are your Saturday hours?", x: "62%", y: "5%",  delay: "1.5s",  duration: "11s", rotate: "2deg",  scale: 0.85 },
  { text: "Can I book a cleaning online?", x: "72%", y: "55%", delay: "3s",    duration: "10s", rotate: "-2deg", scale: 0.95 },
  { text: "Is Dr. Smith taking new patients?", x: "2%",  y: "60%", delay: "2s",    duration: "12s", rotate: "3deg",  scale: 0.8 },
  { text: "How much is teeth whitening?", x: "55%", y: "78%", delay: "4.5s",  duration: "9.5s",rotate: "-4deg", scale: 0.88 },
  { text: "Do you offer payment plans?", x: "18%", y: "82%", delay: "0.8s",  duration: "13s", rotate: "1deg",  scale: 0.92 },
  { text: "Do you do emergency appointments?", x: "38%", y: "3%",  delay: "3.5s",  duration: "10.5s",rotate: "2deg", scale: 0.78 },
  { text: "What insurance do you accept?", x: "80%", y: "28%", delay: "5s",    duration: "11.5s",rotate: "-1deg", scale: 0.86 },
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
            ["--o-start" as string]: "0",
            ["--o-end" as string]: "1",
          }}
        >
          <div
            className="bg-white border border-gray-200 text-gray-500 text-xs px-3 py-2 rounded-xl shadow-sm whitespace-nowrap"
            style={{
              transform: `scale(${b.scale}) rotate(${b.rotate})`,
              opacity: 0.55,
              filter: "blur(0.3px)",
            }}
          >
            {b.text}
          </div>
        </div>
      ))}
    </div>
  );
}
