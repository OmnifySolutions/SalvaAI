"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatWidget({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm the AI receptionist for ${businessName}. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, conversationId, message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble responding right now. Please call our office directly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
          AI
        </div>
        <div>
          <div className="font-semibold text-sm">{businessName}</div>
          <div className="text-xs text-blue-100">AI Receptionist • Online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-2xl rounded-bl-sm text-sm">
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-gray-200 p-3 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-blue-700 transition-colors"
          aria-label="Send"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M3.105 3.105a.75.75 0 0 1 .919-.11l13.5 7.5a.75.75 0 0 1 0 1.31l-13.5 7.5a.75.75 0 0 1-1.05-.949l1.9-4.75a.75.75 0 0 0 0-.612l-1.9-4.75a.75.75 0 0 1 .131-.639Z" />
          </svg>
        </button>
      </form>

      {/* Powered by */}
      <div className="text-center text-xs text-gray-400 pb-2">
        Powered by <span className="font-medium">HustleClaude AI</span>
      </div>
    </div>
  );
}
