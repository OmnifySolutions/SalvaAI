"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Check, Lock, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPlan, type Plan } from "@/lib/plans";
import Logo from "@/components/Logo";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const appearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#2563eb",
    colorBackground: "#ffffff",
    colorText: "#111827",
    colorDanger: "#ef4444",
    fontFamily: "inherit",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid #e5e7eb",
      boxShadow: "none",
      padding: "12px 14px",
    },
    ".Input:focus": {
      border: "1px solid #2563eb",
      boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.15)",
    },
    ".Label": {
      color: "#374151",
      fontWeight: "500",
      fontSize: "13px",
    },
  },
};

// ── Plan Summary Panel ────────────────────────────────────────────────────────

function PlanSummary({
  plan,
  billingCycle,
}: {
  plan: Plan;
  billingCycle: "annual" | "monthly";
}) {
  const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

  return (
    <div className="lg:w-5/12 bg-gray-900 p-10 flex flex-col">
      {/* Badge */}
      {plan.badge && (
        <span className="self-start mb-6 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
          {plan.badge}
        </span>
      )}

      {/* Plan name + price */}
      <div className="mb-8">
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
          {plan.name} Plan
        </p>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-5xl font-black text-white tracking-tight">{price}</span>
          <span className="text-gray-400 text-sm font-medium pb-1.5">/&nbsp;month</span>
        </div>
        {billingCycle === "annual" && (
          <p className="text-orange-400 text-sm font-semibold">
            {plan.annualTotal} billed annually — 2 months free
          </p>
        )}
        {billingCycle === "monthly" && (
          <p className="text-gray-500 text-sm font-medium">Billed monthly · cancel anytime</p>
        )}
      </div>

      {/* Trial callout */}
      <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-4 py-3 mb-8">
        <Sparkles size={16} className="text-orange-400 shrink-0" />
        <p className="text-orange-300 text-sm font-semibold">14-day free trial included</p>
      </div>

      {/* Features */}
      <ul className="space-y-3.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center">
              <Check size={11} className="text-blue-400 stroke-[3]" />
            </span>
            <span className="text-gray-300 font-medium leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <p className="text-gray-600 text-xs font-medium mt-8">
        Cancel or upgrade anytime · No contracts
      </p>
    </div>
  );
}

// ── Checkout Form ─────────────────────────────────────────────────────────────

function CheckoutForm({
  subscriptionId,
  userEmail,
}: {
  subscriptionId: string;
  userEmail: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${APP_URL}/payment-success?subscription_id=${subscriptionId}`,
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email (read-only) */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Account email
        </label>
        <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium">
          {userEmail}
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Payment details
        </label>
        <PaymentElement
          options={{
            layout: "tabs",
            defaultValues: { billingDetails: { email: userEmail } },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !stripe || !elements}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/20"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Processing…
          </span>
        ) : (
          "Start 14-day free trial"
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs font-medium">
        <Lock size={12} />
        <span>Secured by Stripe · No charge during trial</span>
      </div>
    </form>
  );
}

// ── Right Panel ───────────────────────────────────────────────────────────────

function PaymentPanel({
  plan,
  billingCycle,
  userEmail,
}: {
  plan: Plan;
  billingCycle: "annual" | "monthly";
  userEmail: string;
}) {
  const [intent, setIntent] = useState<{ clientSecret: string; subscriptionId: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function createIntent() {
      try {
        const res = await fetch("/api/stripe/create-subscription-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: plan.planKey, billingCycle }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok || !data.clientSecret) {
          setLoadError(data.error ?? "Failed to initialize payment. Please try again.");
          return;
        }
        setIntent({ clientSecret: data.clientSecret, subscriptionId: data.subscriptionId });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setLoadError("Network error. Please refresh and try again.");
        }
      }
    }

    createIntent();
    return () => controller.abort();
  }, [plan.planKey, billingCycle]);

  if (loadError) {
    return (
      <div className="lg:w-7/12 bg-white p-10 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-gray-900 font-bold mb-2">Something went wrong</p>
          <p className="text-gray-500 text-sm mb-6">{loadError}</p>
          <Link href="/pricing" className="text-blue-600 text-sm font-semibold hover:underline">
            ← Back to pricing
          </Link>
        </div>
      </div>
    );
  }

  if (!intent) {
    return (
      <div className="lg:w-7/12 bg-white p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Setting up your trial…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:w-7/12 bg-white p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
          Complete your setup
        </h1>
        <p className="text-gray-500 text-sm font-medium">
          Your trial starts today. You won&apos;t be charged for 14 days.
        </p>
      </div>

      <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret, appearance }}>
        <CheckoutForm subscriptionId={intent.subscriptionId} userEmail={userEmail} />
      </Elements>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function CheckoutPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const planKey = params.get("plan") ?? "pro";
  const billing = (params.get("billing") ?? "annual") as "annual" | "monthly";
  const plan = getPlan(planKey);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      const redirectTarget = `/checkout?plan=${planKey}&billing=${billing}`;
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(redirectTarget)}`);
    }
  }, [isLoaded, isSignedIn, router, planKey, billing]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-bold mb-2">Invalid plan selected</p>
          <Link href="/pricing" className="text-blue-600 text-sm font-semibold hover:underline">
            ← Back to pricing
          </Link>
        </div>
      </div>
    );
  }

  const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo width={100} height={26} />
        </Link>
        <Link
          href="/pricing"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
        >
          <ArrowLeft size={14} />
          Back to pricing
        </Link>
      </div>

      {/* Two-column card */}
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/10 border border-gray-200">
        <PlanSummary plan={plan} billingCycle={billing} />
        <PaymentPanel plan={plan} billingCycle={billing} userEmail={userEmail} />
      </div>

      <p className="text-center text-gray-400 text-xs font-medium mt-8">
        By starting your trial you agree to our{" "}
        <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutPageInner />
    </Suspense>
  );
}
