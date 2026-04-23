"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";

type ChecklistItem = {
  key: string;
  label: string;
  description: string;
  done: boolean;
  href: string;
};

type Props = {
  business: {
    name?: string | null;
    hours?: unknown;
    services?: unknown;
    ai_name?: string | null;
    ai_greeting?: string | null;
    notify_emergency_phone?: string | null;
    notify_emergency_email?: string | null;
    opendental_api_key?: string | null;
  };
};

function servicesConfigured(services: unknown): boolean {
  if (!Array.isArray(services)) return false;
  return services.some((s) => {
    if (!s) return false;
    if (typeof s === "string") return s.trim().length > 0;
    if (typeof s === "object" && "name" in s) return !!(s as { name?: string }).name?.trim();
    return false;
  });
}

export default function SetupChecklist({ business }: Props) {
  const [dismissed, setDismissed] = useState(false);

  const items: ChecklistItem[] = [
    {
      key: "practice",
      label: "Practice info",
      description: "Name and business hours",
      done: !!business.name?.trim() && !!business.hours,
      href: "/settings#profile",
    },
    {
      key: "services",
      label: "Services",
      description: "At least one service added",
      done: servicesConfigured(business.services),
      href: "/settings#services",
    },
    {
      key: "ai",
      label: "AI config",
      description: "Name and greeting",
      done: !!business.ai_name?.trim() && !!business.ai_greeting?.trim(),
      href: "/settings#ai",
    },
    {
      key: "alerts",
      label: "Alerts",
      description: "Emergency contact",
      done: !!(business.notify_emergency_phone || business.notify_emergency_email),
      href: "/settings#notifications",
    },
    {
      key: "opendental",
      label: "Open Dental",
      description: "Calendar sync",
      done: !!business.opendental_api_key,
      href: "/settings#integrations",
    },
  ];

  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = Math.round((completed / total) * 100);
  const allDone = completed === total;

  if (allDone || dismissed) return null;

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-5 py-4 flex items-center gap-6 mb-6">
      {/* Label + progress */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600">Getting started</span>
          <div className="flex items-center gap-2">
            <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-700 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-500">{completed}/{total}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-gray-200 shrink-0" />

      {/* Steps */}
      <div className="flex items-center gap-2 flex-1 flex-wrap">
        {items.map((item) =>
          item.done ? (
            <div
              key={item.key}
              className="flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              <Check size={11} strokeWidth={3} />
              {item.label}
            </div>
          ) : (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <div className="w-2 h-2 rounded-full border-2 border-current opacity-60" />
              {item.label}
            </Link>
          )
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
