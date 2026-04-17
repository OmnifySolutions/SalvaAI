"use client";
import { useState, useMemo } from "react";
import { PhoneCall, MessageSquare, CalendarCheck, Activity } from "lucide-react";

type Conversation = { id: string; channel: string; created_at: string };

const RANGES = [
  { label: "Today", key: "today" },
  { label: "This week", key: "week" },
  { label: "This month", key: "month" },
  { label: "Last 3 months", key: "quarter" },
  { label: "All time", key: "all" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

function getStartDate(range: RangeKey): Date | null {
  const now = new Date();
  switch (range) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "month": {
      const d = new Date(now);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "quarter": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return d;
    }
    case "all":
      return null;
  }
}

const colorMap = {
  blue: "text-blue-600 bg-blue-50",
  green: "text-green-600 bg-green-50",
  orange: "text-orange-600 bg-orange-50",
  yellow: "text-yellow-600 bg-yellow-50",
};

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  trend: string;
  color: keyof typeof colorMap;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
      <div className="text-sm font-medium text-gray-500 mt-1">{label}</div>
      <div className="mt-4 text-xs font-semibold text-gray-400 border-t border-gray-50 pt-3">
        {trend}
      </div>
    </div>
  );
}

export default function DashboardStats({
  allConversations,
  totalInteractions,
  appointmentsTotal,
  appointmentTrend,
}: {
  allConversations: Conversation[];
  totalInteractions: number;
  appointmentsTotal: number;
  appointmentTrend: string;
}) {
  const [range, setRange] = useState<RangeKey>("all");

  const filtered = useMemo(() => {
    const start = getStartDate(range);
    if (!start) return allConversations;
    return allConversations.filter((c) => new Date(c.created_at) >= start!);
  }, [allConversations, range]);

  const phoneCalls = filtered.filter((c) => c.channel === "voice").length;
  const chats = filtered.filter((c) => c.channel !== "voice").length;
  const trendLabel = RANGES.find((r) => r.key === range)?.label ?? "All time";

  return (
    <div className="mb-4">
      {/* Filter row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Overview
        </span>
        <div className="flex flex-wrap gap-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                range === r.key
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total Interactions"
          value={totalInteractions}
          trend="All time"
          color="blue"
        />
        <StatCard
          icon={CalendarCheck}
          label="Appointments Booked"
          value={appointmentsTotal}
          trend={appointmentTrend}
          color="green"
        />
        <StatCard
          icon={PhoneCall}
          label="Phone Calls"
          value={phoneCalls}
          trend={trendLabel}
          color="orange"
        />
        <StatCard
          icon={MessageSquare}
          label="Chats"
          value={chats}
          trend={trendLabel}
          color="yellow"
        />
      </div>
    </div>
  );
}
