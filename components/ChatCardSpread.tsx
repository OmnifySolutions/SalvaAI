import { PhoneCall, MapPin, Search } from "lucide-react";

const scenarios = [
  {
    label: "New patient",
    messages: [
      { role: "user", text: "Are you guys taking new patients right now?" },
      { role: "ai",   text: "Yes, we are! Dr. Smith has an opening tomorrow at 2:00 PM for a new patient exam. Should I lock that in for you?" },
      { role: "user", text: "That sounds great, let's do it!" },
    ],
  },
  {
    label: "After-hours",
    messages: [
      { role: "user", text: "I chipped my tooth and I'm in a lot of pain." },
      { role: "ai",   text: "I'm so sorry you're dealing with that. Our office is closed, but I am routing your number to the on-call dentist immediately." },
    ],
  },
  {
    label: "Insurance",
    messages: [
      { role: "user", text: "Do you accept Delta Dental?" },
      { role: "ai",   text: "Yes, we are in-network with Delta Dental PPO! Want me to check your specific benefits before you come in?" },
      { role: "user", text: "That would be awesome, thanks." },
    ],
  },
];

// We restrict to 3 scenarios max
const activeScenarios = scenarios.slice(0, 3);
const duplicatedScenarios = [...activeScenarios, ...activeScenarios];
const trackItems = [...duplicatedScenarios, ...duplicatedScenarios]; // Total 12 items

export default function ChatCardSpread() {
  return (
    <div className="relative w-full max-w-4xl mx-auto h-[400px] overflow-hidden flex items-center bg-transparent mt-10">
      
      {/* Heavy fade out on edges to force center focus */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-white via-transparent to-white via-[35%_65%]" />

      <div className="flex gap-6 animate-marquee items-center w-max pl-6">
        {trackItems.map((s, i) => (
          <div
            key={i}
            className="w-[320px] bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col shrink-0 relative"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                {s.label === "New patient" && <PhoneCall size={12} />}
                {s.label === "After-hours" && <MapPin size={12} />}
                {s.label === "Insurance"   && <Search size={12} />}
              </div>
              <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">
                {s.label}
              </span>
            </div>

            {/* Messages */}
            <div className="space-y-3 flex-1 flex flex-col justify-end">
              {s.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`px-3.5 py-2.5 rounded-2xl text-sm max-w-[85%] leading-snug ${
                    m.role === "ai"
                      ? "bg-blue-600 text-white self-start rounded-tl-sm shadow-sm"
                      : "bg-gray-100 text-gray-800 self-end rounded-tr-sm"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
