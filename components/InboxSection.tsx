"use client";

import { useEffect, useState, useRef } from "react";
import { AlertTriangle, Calendar, Phone, MessageSquare, PhoneCall, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  const [isRotating, setIsRotating] = useState(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatRef = useRef<number>(Date.now());

  async function fetchInbox() {
    try {
      const res = await fetch("/api/inbox");
      const json = await res.json();
      setItems(json.items ?? []);
      lastHeartbeatRef.current = Date.now();
    } catch {
      // silently fail — dashboard still works
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInbox();

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel("conversations", { config: { broadcast: { self: true } } })
        .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
          fetchInbox();
        })
        .subscribe();
    } catch (e) {
      console.warn("Realtime unavailable, using polling fallback", e);
    }

    pollIntervalRef.current = setInterval(() => {
      const timeSinceHeartbeat = Date.now() - lastHeartbeatRef.current;
      if (timeSinceHeartbeat > 60000) fetchInbox();
    }, 30000);

    return () => {
      if (channel) channel.unsubscribe();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isRotating) return;

    rotationIntervalRef.current = setInterval(() => {
      setActiveTab((prev) => {
        const tabs: Tab[] = ["emergencies", "bookings", "callbacks"];
        const currentIndex = tabs.indexOf(prev);
        return tabs[(currentIndex + 1) % tabs.length];
      });
    }, 10000);

    return () => {
      if (rotationIntervalRef.current) clearInterval(rotationIntervalRef.current);
    };
  }, [isRotating]);

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

  const tabs: { id: Tab; label: string; count: number; icon: React.ReactNode; color: string }[] = [
    { id: "emergencies", label: "Emergencies", count: emergencies.length, icon: <AlertTriangle size={16} />, color: "red" },
    { id: "bookings", label: "Pending Bookings", count: bookings.length, icon: <Calendar size={16} />, color: "blue" },
    { id: "callbacks", label: "Callbacks", count: callbacks.length, icon: <Phone size={16} />, color: "orange" },
  ];

  const totalUnresolved = items.length;
  const activeItems = activeTab === "emergencies" ? emergencies : activeTab === "bookings" ? bookings : callbacks;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Action Required</h2>
            {totalUnresolved > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                {totalUnresolved} NEW
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 font-medium mt-1">Review and resolve incoming requests</p>
        </div>
        <div className="text-[10px] bg-gray-900 text-white font-black px-2 py-1 rounded-md uppercase tracking-[0.2em] shadow-lg flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
          {loading ? (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse border border-blue-200" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
          )}
          Auto-syncing
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsRotating(false);
              }}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                isActive
                  ? tab.color === "red"
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20 scale-105"
                    : tab.color === "blue"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105"
                    : "bg-orange-600 text-white shadow-lg shadow-orange-600/20 scale-105"
                  : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              {tab.icon} {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Items list */}
      <ul className="space-y-4">
        {loading ? (
          <li className="px-6 py-12 text-center text-gray-400 text-sm font-medium">Refreshing...</li>
        ) : activeItems.length === 0 ? (
          <li className="flex flex-col items-center justify-center py-12">
            <CheckCircle size={48} className="text-green-500 mb-3" />
            <p className="text-gray-500 text-center font-medium">All clear — nothing to do here.</p>
          </li>
        ) : (
          activeItems.map((item) => {
            const isRed = item.urgency === "emergency";
            const isBlue = item.appointment_requested;
            
            const colorBlock = isRed
              ? "bg-red-100 text-red-600"
              : isBlue
              ? "bg-blue-100 text-blue-600"
              : "bg-orange-100 text-orange-600";
              
            const btnColor = isRed
              ? "bg-red-600 shadow-red-600/20 hover:bg-red-700"
              : isBlue
              ? "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700"
              : "bg-orange-600 shadow-orange-600/20 hover:bg-orange-700";

            return (
              <li key={item.id} className="flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-[24px] hover:bg-white hover:shadow-xl transition-all group list-none">
                <div className="flex items-center gap-5 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110 shrink-0 ${colorBlock}`}>
                    {item.channel === "voice" ? <PhoneCall size={18} /> : <MessageSquare size={18} />}
                  </div>
                  <div className="min-w-0 pr-4">
                    <p className="text-[15px] font-black text-gray-900 tracking-tight truncate flex items-center gap-2">
                       {callerLabel(item)}
                       {isRed && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md uppercase tracking-wide">Critical</span>}
                    </p>
                    <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider truncate mt-0.5">
                      {item.channel} • {timeAgo(item.created_at)}
                    </p>
                    {(item.summary || item.appointment_notes) && (
                      <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                        {item.summary ?? item.appointment_notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-4 items-start">
                  <button
                    onClick={() => resolve(item.id)}
                    disabled={resolving === item.id}
                    className={`text-[11px] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${btnColor}`}
                  >
                    {resolving === item.id ? "Resolving..." : "Resolve"}
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
