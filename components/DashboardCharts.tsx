// components/DashboardCharts.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";

const callVolumeData = [
  { name: "Mon", calls: 42, handled: 18 },
  { name: "Tue", calls: 58, handled: 24 },
  { name: "Wed", calls: 35, handled: 12 },
  { name: "Thu", calls: 64, handled: 31 },
  { name: "Fri", calls: 45, handled: 15 },
  { name: "Sat", calls: 20, handled: 14 },
  { name: "Sun", calls: 10, handled: 8 },
];

const revenueData = [
  { name: "W1", revenue: 4250 },
  { name: "W2", revenue: 5800 },
  { name: "W3", revenue: 7650 },
  { name: "W4", revenue: 9100 },
];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Trailing 7 Days Call Volume */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Call Volume Handled</h3>
            <p className="text-xs text-gray-500 mt-1">AI agent vs. normal business calls</p>
          </div>
          <select className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={callVolumeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Bar dataKey="calls" name="Total Calls" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="handled" name="Handled by AI" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Recovered */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Revenue Saved</h3>
            <p className="text-xs text-gray-500 mt-1">Based on new patient bookings via AI</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-green-600">+$26,800</div>
            <p className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">+14% vs last month</p>
          </div>
        </div>
        <div className="h-64">
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
        </div>
      </div>
    </div>
  );
}
