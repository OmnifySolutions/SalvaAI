"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Calendar, Phone, MessageSquare, PhoneCall, CheckCircle } from "lucide-react";

type InboxItem = {
  id: string;
  channel: "voice" | "chat";
  urgency: "emergency" | "urgent" | "routine";
  appointment_requested: boolean;
  appointment_booked_status: string | null;
  callback_requested: boolean;
  visitor_name: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  summary: string | null;
  appointment_notes: string | null;
  created_at: string;
};

type Tab = "emergencies" | "bookings" | "callbacks";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function callerLabel(item: InboxItem): string {
  return item.visitor_name ?? item.visitor_phone ?? item.visitor_email ?? "Unknown caller";
}

export default function InboxSection() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("emergencies");
  const [resolving, setResolving] = useState<string | null>(null);

  async function fetchInbox() {
    try {
      const res = await fetch("/api/inbox");
      const json = await res.json();
      setItems(json.items ?? []);
    } catch {
      // silently fail — dashboard still works
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchInbox(); }, []);

  async function resolve(id: string) {
    setResolving(id);
    try {
      await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id }),
      });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setResolving(null);
    }
  }

  const emergencies = items.filter((i) => i.urgency === "emergency");
  const bookings = items.filter((i) => i.appointment_requested && i.appointment_booked_status !== "confirmed" && i.urgency !== "emergency");
  const callbacks = items.filter((i) => i.callback_requested && i.urgency !== "emergency" && !i.appointment_requested);

  const tabs: { id: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    { id: "emergencies", label: "Emergencies", count: emergencies.length, icon: <AlertTriangle size={15} /> },
    { id: "bookings", label: "Pending Bookings", count: bookings.length, icon: <Calendar size={15} /> },
    { id: "callbacks", label: "Callbacks", count: callbacks.length, icon: <Phone size={15} /> },
  ];

  const totalUnresolved = items.length;
  if (!loading && totalUnresolved === 0) return null;

  const activeItems = activeTab === "emergencies" ? emergencies : activeTab === "bookings" ? bookings : callbacks;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-gray-900">Action Required</h2>
          {totalUnresolved > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalUnresolved}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">Review and resolve incoming requests</p>
      </div>

      {/* Tab pills */}
      <div className="flex gap-1 px-6 pt-4 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? tab.id === "emergencies"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                activeTab === tab.id
                  ? tab.id === "emergencies" ? "bg-red-200 text-red-800" : "bg-blue-200 text-blue-800"
                  : "bg-gray-200 text-gray-600"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Items list */}
      <ul className="divide-y divide-gray-50">
        {loading ? (
          <li className="px-6 py-8 text-center text-gray-400 text-sm">Loading...</li>
        ) : activeItems.length === 0 ? (
          <li className="px-6 py-10 text-center">
            <CheckCircle size={28} className="mx-auto text-green-400 mb-2" />
            <p className="text-sm text-gray-400 font-medium">All clear — nothing to action here.</p>
          </li>
        ) : (
          activeItems.map((item) => (
            <li key={item.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  item.urgency === "emergency" ? "bg-red-50 text-red-500" :
                  item.appointment_requested ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-500"
                }`}>
                  {item.channel === "voice" ? <PhoneCall size={18} /> : <MessageSquare size={18} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">{callerLabel(item)}</span>
                    {item.urgency === "emergency" && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Emergency</span>
                    )}
                    <span className="text-xs text-gray-400">{timeAgo(item.created_at)}</span>
                  </div>
                  {(item.summary || item.appointment_notes) && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                      {item.summary ?? item.appointment_notes}
                    </p>
                  )}
                  {item.visitor_phone && item.visitor_name && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.visitor_phone}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => resolve(item.id)}
                disabled={resolving === item.id}
                className="shrink-0 text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all disabled:opacity-40 mt-0.5"
              >
                {resolving === item.id ? "..." : "Resolve"}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
