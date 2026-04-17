"use client";
import { useState } from "react";
import { Calendar, Moon, User, ListChecks } from "lucide-react";

const configs = [
  {
    key: "booking",
    icon: Calendar,
    label: "Instant booking",
    description: "AI books appointments directly into your calendar",
    question: "Can I book an appointment for Tuesday?",
    on: "Of course! I can book that right now. Morning or afternoon works better for you?",
    off: "Absolutely! I'll pass this along and our team will reach out within 24 hours to confirm.",
  },
  {
    key: "afterhours",
    icon: Moon,
    label: "After-hours mode",
    description: "Different AI behavior outside your office hours",
    question: "Are you open? I have tooth pain and need help.",
    on: "We're currently closed, but I'm here 24/7. For urgent pain, I can take your details and flag this for first thing tomorrow — or connect you to our emergency line.",
    off: "Thanks for calling Bright Smiles Dental! How can I help you today?",
  },
  {
    key: "name",
    icon: User,
    label: "Custom AI name",
    description: "Your AI introduces itself as part of your brand",
    question: "Who am I speaking with?",
    on: "Hi! I'm Claire, the AI receptionist for Bright Smiles Dental. What can I help you with today?",
    off: "Hi! I'm the AI receptionist. What can I help you with today?",
  },
  {
    key: "donts",
    icon: ListChecks,
    label: "Do's & Don'ts rules",
    description: "Hard rules for what the AI will and won't say",
    question: "How much does a crown cost?",
    on: "Great question! I'm not set up to quote prices, but I can schedule a free consult where our team will walk you through all your options.",
    off: "A dental crown typically runs $1,000–$1,500 depending on the material and the complexity of your case.",
  },
] as const;

type ConfigKey = typeof configs[number]["key"];

export default function CustomizabilityDemo() {
  const [active, setActive] = useState<Set<ConfigKey>>(new Set(["booking", "name"]));
  const [focused, setFocused] = useState<ConfigKey>("booking");

  function toggle(key: ConfigKey) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setFocused(key);
  }

  const focusedConfig = configs.find((c) => c.key === focused)!;
  const isOn = active.has(focused);

  return (
    <section className="bg-gray-50 py-24 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            Fully Configurable
          </div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Trained your way. Configured in minutes.
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Toggle any behavior on or off. Your AI does exactly what you want — and nothing you don&apos;t.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: toggles */}
          <div className="space-y-3">
            {configs.map((c) => {
              const on = active.has(c.key);
              const isFocused = focused === c.key;
              return (
                <div
                  key={c.key}
                  onClick={() => toggle(c.key)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isFocused
                      ? on
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 bg-gray-100"
                      : on
                      ? "border-blue-200 bg-blue-50/30 hover:border-blue-300"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      on ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <c.icon size={20} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${on ? "text-gray-900" : "text-gray-500"}`}>
                      {c.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
                  </div>
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                      on ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                        on ? "left-6" : "left-1"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-gray-400 pt-2 pl-1">
              Click any setting to see how it changes your AI&apos;s response →
            </p>
          </div>

          {/* Right: live preview */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
              Live Preview
            </p>
            <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
              {/* Mock chat header */}
              <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-2">
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  AI
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    {active.has("name") ? "Claire — Bright Smiles Dental" : "AI Receptionist"}
                  </div>
                  <div className="text-xs text-blue-100">Online</div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Patient question */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm max-w-[85%]">
                    {focusedConfig.question}
                  </div>
                </div>

                {/* AI response */}
                <div className="flex justify-start">
                  <div
                    key={`${focused}-${isOn}`}
                    className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm max-w-[90%] leading-relaxed shadow-sm"
                  >
                    {isOn ? focusedConfig.on : focusedConfig.off}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isOn ? "bg-green-500" : "bg-gray-300"}`}
              />
              <p className="text-xs text-gray-500">
                <span className="font-semibold">{focusedConfig.label}</span> is{" "}
                <span className={isOn ? "text-green-600 font-semibold" : "text-gray-400"}>
                  {isOn ? "ON" : "OFF"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
