"use client";
import { useState } from "react";
import ChatWidget from "@/components/ChatWidget";
import { MessageSquare, X } from "lucide-react";

export default function FloatingChatWidget({ businessId }: { businessId: string }) {
  const [open, setOpen] = useState(false);
  if (!businessId) return null;

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
          <ChatWidget businessId={businessId} businessName="Salva AI" />
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-100 flex items-center justify-center text-white ${
          open ? "bg-gray-700 hover:bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
        }`}
        aria-label={open ? "Close chat" : "Chat with us"}
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>
    </div>
  );
}
