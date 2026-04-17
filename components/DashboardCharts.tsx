// components/DashboardCharts.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type CallPoint = { name: string; calls: number; handled: number };
type RevenuePoint = { name: string; revenue: number };
type UrgencyData = { emergency: number; urgent: number; routine: number };
type HourPoint = { hour: number; count: number };

type Props = {
  callVolumeData?: CallPoint[];
  revenueData?: RevenuePoint[];
  revenueTotal?: number;
  revenueDelta?: number;
  urgencyData?: UrgencyData;
  peakHoursData?: HourPoint[];
};

const formatHour = (h: number) => {
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  return h < 12 ? `${h}a` : `${h - 12}p`;
};

export default function DashboardCharts({
  callVolumeData = [],
  revenueData = [],
  revenueTotal = 0,
  revenueDelta = 0,
  urgencyData = { emergency: 0, urgent: 0, routine: 0 },
  peakHoursData = [],
}: Props) {
  const hasCalls = callVolumeData.some((d) => d.calls > 0);
  const hasRevenue = revenueData.some((d) => d.revenue > 0);
  const urgencyTotal = urgencyData.emergency + urgencyData.urgent + urgencyData.routine;
  const hasHours = peakHoursData.some((d) => d.count > 0);

  // Top 3 hours for highlight
  const sortedHours = [...peakHoursData].sort((a, b) => b.count - a.count).slice(0, 3);
  const topHours = new Set(sortedHours.filter((h) => h.count > 0).map((h) => h.hour));

  const urgencySlices = [
    { name: "Emergency", value: urgencyData.emergency, color: "#dc2626" },
    { name: "Urgent", value: urgencyData.urgent, color: "#f59e0b" },
    { name: "Routine", value: urgencyData.routine, color: "#9ca3af" },
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trailing 7 Days Call Volume */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Call Volume Handled</h3>
              <p className="text-xs text-gray-500 mt-1">AI agent vs. total inquiries</p>
            </div>
            <span className="text-xs text-gray-400">Last 7 days</span>
          </div>
          <div className="h-64">
            {hasCalls ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callVolumeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <Tooltip
                    cursor={{ fill: "#f9fafb" }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="calls" name="Total Inquiries" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="handled" name="Voice Handled" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState label="Waiting for call data…" />
            )}
          </div>
        </div>

        {/* Revenue Recovered */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Revenue Saved</h3>
              <p className="text-xs text-gray-500 mt-1">Based on AI-booked appointments</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">
                {hasRevenue ? `+$${revenueTotal.toLocaleString()}` : "$0"}
              </div>
              {hasRevenue && revenueDelta !== 0 && (
                <p className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
                  {revenueDelta > 0 ? "+" : ""}
                  {revenueDelta}% vs last period
                </p>
              )}
            </div>
          </div>
          <div className="h-64">
            {hasRevenue ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    itemStyle={{ color: "#16a34a" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState label="No AI-booked appointments yet." />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgency Donut */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900">Urgent vs. Routine</h3>
            <p className="text-xs text-gray-500 mt-1">Intent mix, last 30 days</p>
          </div>
          <div className="h-64">
            {urgencyTotal > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={urgencySlices}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    label={(entry: { value?: number }) => (entry.value ? String(entry.value) : "")}
                  >
                    {urgencySlices.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState label="No conversations yet." />
            )}
          </div>
        </div>

        {/* Peak Contact Hours */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900">Peak Contact Hours</h3>
            <p className="text-xs text-gray-500 mt-1">Best times to have staff available</p>
          </div>
          <div className="h-64">
            {hasHours ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={peakHoursData.map((d) => ({ ...d, label: formatHour(d.hour) }))}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} interval={2} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <Tooltip
                    cursor={{ fill: "#f9fafb" }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="count" name="Contacts" radius={[4, 4, 0, 0]} barSize={10}>
                    {peakHoursData.map((d) => (
                      <Cell key={d.hour} fill={topHours.has(d.hour) ? "#2563eb" : "#e5e7eb"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState label="No contact data yet." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
      {label}
    </div>
  );
}
