"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink, AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";

const PLAN_LABELS: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  growth: "Growth",
  multi: "Multi-Practice",
};

export default function SubscriptionWall({
  plan,
  planStatus,
  stripeCustomerId,
}: {
  plan: string;
  planStatus: string;
  stripeCustomerId: string | null;
}) {
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  const isPastDue = planStatus === "past_due";
  const planLabel = PLAN_LABELS[plan] ?? plan;

  async function handleOpenPortal() {
    setPortalLoading(true);
    setPortalError("");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank", "noopener");
      else setPortalError("Could not open billing portal. Try again.");
    } catch { setPortalError("Could not open billing portal."); }
    finally { setPortalLoading(false); }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-20 bg-gray-50 min-h-[600px]">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-6">
          {isPastDue ? (
            <AlertTriangle size={28} className="text-orange-500" />
          ) : (
            <Lock size={28} className="text-orange-500" />
          )}
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          {isPastDue ? "Payment failed" : "Your subscription has ended"}
        </h2>

        {/* Subtext */}
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          {isPastDue
            ? `We couldn't collect payment for your ${planLabel} plan. Update your payment method to restore access.`
            : `Your ${planLabel} plan has ended. Reactivate to restore access to your AI receptionist, inbox, and all features.`}
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Your settings and conversation history are saved and will be restored when you reactivate.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          {isPastDue && stripeCustomerId ? (
            <>
              <button
                onClick={handleOpenPortal}
                disabled={portalLoading}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
              >
                {portalLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ExternalLink size={15} />
                )}
                Update payment method
              </button>
              <Link
                href="/pricing"
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                View plans
              </Link>
            </>
          ) : (
            <>
              <Link
                href={`/pricing`}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
              >
                Reactivate {planLabel}
                <ArrowRight size={15} />
              </Link>
              {stripeCustomerId && (
                <button
                  onClick={handleOpenPortal}
                  disabled={portalLoading}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3.5 rounded-xl text-sm transition-colors"
                >
                  {portalLoading ? (
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <ExternalLink size={14} />
                  )}
                  Manage billing
                </button>
              )}
            </>
          )}
        </div>

        {portalError && (
          <p className="text-xs text-red-500 font-medium mt-3">{portalError}</p>
        )}

        <p className="text-xs text-gray-400 mt-6">
          Questions?{" "}
          <a href="mailto:support@getsalvaai.com" className="underline hover:text-gray-600">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
