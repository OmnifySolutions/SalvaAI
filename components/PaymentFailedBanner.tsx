"use client";

import { useState } from "react";
import { AlertTriangle, ExternalLink, X } from "lucide-react";

const LOCK_AFTER_DAYS = 7;

function daysRemaining(paymentFailedAt: string): number {
  const failedMs = new Date(paymentFailedAt).getTime();
  const lockMs = failedMs + LOCK_AFTER_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((lockMs - Date.now()) / (24 * 60 * 60 * 1000)));
}

export default function PaymentFailedBanner({
  paymentFailedAt,
  stripeCustomerId,
}: {
  paymentFailedAt: string;
  stripeCustomerId: string | null;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  if (dismissed) return null;

  const days = daysRemaining(paymentFailedAt);

  async function handleOpenPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank", "noopener");
    } catch { /* non-fatal */ }
    finally { setPortalLoading(false); }
  }

  const urgency = days <= 2 ? "high" : days <= 5 ? "medium" : "low";

  return (
    <div className={`w-full border-b px-6 py-3 flex items-center justify-between gap-4 ${
      urgency === "high"
        ? "bg-red-50 border-red-200"
        : "bg-amber-50 border-amber-200"
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <AlertTriangle
          size={16}
          className={`shrink-0 ${urgency === "high" ? "text-red-500" : "text-amber-500"}`}
        />
        <p className={`text-sm font-semibold truncate ${urgency === "high" ? "text-red-800" : "text-amber-800"}`}>
          Payment failed.{" "}
          <span className="font-black">
            {days === 0
              ? "Your access will be locked today."
              : `Update now or your services will be locked in ${days} day${days === 1 ? "" : "s"}.`}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {stripeCustomerId && (
          <button
            onClick={handleOpenPortal}
            disabled={portalLoading}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              urgency === "high"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            } disabled:opacity-60`}
          >
            {portalLoading ? (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ExternalLink size={12} />
            )}
            Update payment
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
