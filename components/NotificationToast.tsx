"use client";

import { AlertTriangle, X } from "lucide-react";
import { useNotifications } from "./NotificationContext";

export default function NotificationToast() {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white border border-red-200 rounded-2xl shadow-2xl px-4 py-3 flex items-start gap-3 animate-in slide-in-from-right-4 duration-200"
        >
          <div className="w-8 h-8 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-900">{toast.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{toast.body}</p>
            {toast.locationName && (
              <span className="inline-block mt-1 text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded-md">
                {toast.locationName}
              </span>
            )}
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-gray-300 hover:text-gray-500 transition-colors shrink-0 mt-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
