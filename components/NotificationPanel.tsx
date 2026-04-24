"use client";

import { useEffect, useRef } from "react";
import { X, PhoneCall, MessageSquare, AlertTriangle, Calendar, Phone } from "lucide-react";
import Link from "next/link";
import { type InboxItem, timeAgo, callerLabel, getLocationColor } from "@/lib/inbox-utils";

type Props = {
  items: InboxItem[];
  loading: boolean;
  onClose: () => void;
};

export default function NotificationPanel({ items, loading, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-900">Notifications</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">All clear — no pending items.</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((item) => {
              const isEmergency = item.urgency === "emergency";
              return (
                <li key={item.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isEmergency ? "bg-red-100 text-red-600" : item.appointment_requested ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}>
                      {isEmergency ? <AlertTriangle size={13} /> : item.appointment_requested ? <Calendar size={13} /> : item.callback_requested ? <Phone size={13} /> : item.channel === "voice" ? <PhoneCall size={13} /> : <MessageSquare size={13} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{callerLabel(item)}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{item.channel} · {timeAgo(item.created_at)}</span>
                        {item.location_name && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${getLocationColor(item.location_name)}`}>
                            {item.location_name}
                          </span>
                        )}
                      </p>
                    </div>
                    {isEmergency && (
                      <span className="text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-md uppercase shrink-0">
                        URGENT
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <Link
          href="/dashboard?location=all"
          onClick={onClose}
          className="block text-center text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
        >
          View all in dashboard →
        </Link>
      </div>
    </div>
  );
}
