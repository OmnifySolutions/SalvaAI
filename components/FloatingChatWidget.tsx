"use client";
import { useState } from "react";
import ChatWidget, { WidgetConfig } from "@/components/ChatWidget";
import { MessageSquare, X } from "lucide-react";

export default function FloatingChatWidget({
  businessId,
  widgetConfig,
}: {
  businessId: string;
  widgetConfig?: WidgetConfig;
}) {
  const [open, setOpen] = useState(false);
  if (!businessId) return null;

  const hasLabel = widgetConfig?.button_label && widgetConfig.button_label.trim().length > 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 sm:w-[360px] h-[480px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative bg-white">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2.5 right-3 z-10 text-white/70 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
          <ChatWidget businessId={businessId} businessName="Salva AI" widgetConfig={widgetConfig} />
        </div>
      )}
      <div className="relative flex flex-col items-end gap-3">
        {!open && widgetConfig?.greeting_enabled && widgetConfig?.greeting_text && (
          <div className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-2 text-sm text-gray-700 max-w-[200px] whitespace-normal">
            {widgetConfig.greeting_text}
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className={`shadow-2xl transition-all hover:scale-105 active:scale-100 flex items-center justify-center text-white ${
            hasLabel ? "rounded-full px-4 h-14" : "w-14 h-14 rounded-full"
          } ${open ? "bg-gray-700 hover:bg-gray-600" : ""}`}
          style={!open ? { background: widgetConfig?.primary_color ?? "#2563eb" } : undefined}
          aria-label={open ? "Close chat" : "Chat with us"}
        >
          {open ? (
            <X size={22} />
          ) : (
            <span className="flex items-center gap-2">
              <MessageSquare size={22} />
              {hasLabel && (
                <span className="text-white text-sm font-semibold whitespace-nowrap">
                  {widgetConfig!.button_label}
                </span>
              )}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
