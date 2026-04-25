"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import UpgradeButton from "@/components/UpgradeButton";
import Logo from "@/components/Logo";
import { PLANS } from "@/lib/plans";
import type { PlanKey } from "@/lib/plans";

// Metadata is now in layout.tsx since this is a client component

type PlanType = PlanKey;

const comparison = [
  {
    feature: "Starting price",
    salvai: "$65 / mo",
    dentina: "$399 / mo",
    dentalaiassist: "$299 / mo",
  },
  {
    feature: "Pro / Entry voice pricing",
    salvai: "$249 / mo",
    dentina: "$399 / mo",
    dentalaiassist: "$299 / mo",
  },
  {
    feature: "Voice minutes at entry",
    salvai: "1,000 min / mo",
    dentina: "Unlimited",
    dentalaiassist: "600 min / mo",
  },
  {
    feature: "Chat widget included",
    salvai: true,
    dentina: true,
    dentalaiassist: false,
  },
  {
    feature: "Multi-location pricing",
    salvai: "$1,049 / mo (5 locs)",
    dentina: "$2,000+ / mo (5 locs)",
    dentalaiassist: "Custom",
  },
  {
    feature: "Per-location minute limit",
    salvai: "1,000 min each",
    dentina: false,
    dentalaiassist: false,
  },
  {
    feature: "14-day free trial",
    salvai: true,
    dentina: false,
    dentalaiassist: false,
  },
  {
    feature: "Setup time",
    salvai: "Under 5 min",
    dentina: "Several hours",
    dentalaiassist: "Several hours",
  },
];

const faqs = [
  {
    q: "Do I need a developer to set this up?",
    a: "No. You copy one line of code and paste it into your website before the closing </body> tag. Most practice managers can do it in under 5 minutes.",
  },
  {
    q: "What's included in the 14-day free trial?",
    a: "You get full access to whichever plan you choose — Basic, Pro, Growth, or Multi-Practice. No credit card required upfront. After 14 days, your card will be charged the plan price you selected. Cancel anytime.",
  },
  {
    q: "What happens if I exceed my monthly voice minutes?",
    a: "You can purchase overage minutes at $0.35/min, or upgrade to a higher plan anytime. Unused minutes don't roll over to the next month.",
  },
  {
    q: "Is patient data safe?",
    a: "Yes. We never collect or store personal health information (PHI). The AI handles general questions — it directs patients to call for anything clinical. HIPAA-compliant.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no cancellation fees. Upgrade, downgrade, or cancel from your dashboard whenever you want.",
  },
  {
    q: "Is a Business Associate Agreement (BAA) available?",
    a: "Yes. A BAA is available on Pro, Growth, and Multi-Practice plans. Contact us after signing up and we'll send one over.",
  },
];

const planTiers: Record<PlanType | "free", number> = {
  free: 0,
  basic: 1,
  pro: 2,
  growth: 3,
  multi: 4,
};

function computePlanCTA(
  planKey: PlanType,
  currentPlan: PlanType | "free",
  isLoggedIn: boolean,
  isLoaded: boolean,
  planCta: string,
  planCtaLoggedIn: string,
) {
  const isCurrent = isLoaded && isLoggedIn && currentPlan === planKey;
  const isDowngrade = isLoaded && isLoggedIn && planTiers[planKey] < planTiers[currentPlan];
  const useUpgrade = isLoaded && isLoggedIn && !isCurrent && currentPlan !== "free";
  const useCheckout = isLoaded && isLoggedIn && !isCurrent && currentPlan === "free";
  let cta = planCta;
  if (isCurrent) cta = "Current plan";
  else if (isLoggedIn && currentPlan !== "free") {
    cta = isDowngrade ? "Downgrade to this plan" : planCtaLoggedIn;
  }
  return { isCurrent, isDowngrade, useUpgrade, useCheckout, cta };
}

export default function PricingPage() {
  const { userId } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanType | "free">("free");
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (userId) {
      const fetchUserPlan = async () => {
        try {
          const response = await fetch("/api/user-plan");
          if (response.ok) {
            const data = await response.json();
            if (data.plan) {
              setCurrentPlan(data.plan);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user plan:", error);
        } finally {
          setIsLoaded(true);
        }
      };
      fetchUserPlan();
    } else {
      setIsLoaded(true);
    }
  }, [userId]);

  const isLoggedIn = !!userId;

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900" style={{ fontFamily: "var(--font-geist-sans)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo width={110} height={27} />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
              <Link href="/how-it-works" className="hover:text-gray-800 transition-colors">How it works</Link>
              <Link href="/pricing" className="text-gray-900 font-medium">Pricing</Link>
              <Link href="/faq" className="hover:text-gray-800 transition-colors">FAQ</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/sign-up?plan=pro"
                  className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20 bg-[#fafafa]">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Transparent pricing. No contracts.
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto mb-8">
            Setup in 5 minutes. 14-day free trial. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-1 bg-gray-200 rounded-full p-1">
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                  billingCycle === "annual"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Billed annually <span className="ml-1 inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">Save 2 months</span>
              </button>
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        {/* Plans — Basic / Pro / Growth row (3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.slice(0, 3).map((plan) => {
            const { isCurrent, useUpgrade, useCheckout, cta } = computePlanCTA(
              plan.planKey, currentPlan, isLoggedIn, isLoaded, plan.cta, plan.ctaLoggedIn,
            );
            const href = isLoggedIn
              ? `/checkout?plan=${plan.planKey}&billing=${billingCycle}`
              : `/sign-up?plan=${plan.planKey}&billing=${billingCycle}`;
            const displayPrice = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.planKey}
                className={`relative rounded-3xl p-8 flex flex-col h-full transition-all ${
                  plan.highlight
                    ? "bg-gray-900 text-white shadow-2xl scale-[1.02] z-10 border-gray-800"
                    : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h2 className={`text-sm font-bold uppercase tracking-widest mb-3 ${plan.highlight ? "text-blue-400" : "text-gray-400"}`}>
                    {plan.name}
                  </h2>
                  <div className="flex items-end gap-1 mb-3">
                    <span className={`text-5xl font-black tracking-tight ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                      {displayPrice}
                    </span>
                    <span className="text-sm pb-1.5 text-gray-400 font-medium">{plan.period}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                </div>

                {/* flex-1 to push the CTA button to the absolute bottom evenly! */}
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${
                        plan.highlight ? "bg-blue-900/50 border-blue-500/30 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
                      }`}>
                        <Check size={12} className="stroke-[3]" />
                      </span>
                      <span className={`font-medium ${plan.highlight ? "text-gray-300" : "text-gray-600"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {useUpgrade ? (
                    <UpgradeButton
                      plan={plan.planKey}
                      billingCycle={billingCycle}
                      className={`w-full py-4 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 ${
                        plan.highlight
                          ? "bg-white text-gray-900 hover:bg-gray-100 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                          : "bg-gray-900 text-white hover:bg-gray-700 shadow-lg"
                      }`}
                    >
                      {cta}
                    </UpgradeButton>
                  ) : useCheckout ? (
                    <Link
                      href={`/checkout?plan=${plan.planKey}&billing=${billingCycle}`}
                      className={`block text-center py-4 rounded-xl text-sm font-bold transition-colors shadow-lg ${
                        plan.highlight
                          ? "bg-white text-gray-900 hover:bg-gray-100 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                          : "bg-gray-900 text-white hover:bg-gray-700"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <Link
                      href={href}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`block text-center py-4 rounded-xl text-sm font-bold transition-colors shadow-lg ${
                        isCurrent
                          ? "bg-gray-100 text-gray-400 cursor-default pointer-events-none shadow-none"
                          : plan.highlight
                            ? "bg-white text-gray-900 hover:bg-gray-100 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            : "bg-gray-900 text-white hover:bg-gray-700"
                      }`}
                    >
                      {cta}
                    </Link>
                  )}

                  <div className="h-6 mt-3">
                    <p className={`text-[11px] font-medium text-center ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                      Cancel or upgrade anytime
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-Practice — full-width horizontal card */}
        {(() => {
          const multiPlan = PLANS[3];
          const { isCurrent: multiIsCurrent, useUpgrade: multiUseUpgrade, useCheckout: multiUseCheckout, cta: multiCta } = computePlanCTA(
            multiPlan.planKey, currentPlan, isLoggedIn, isLoaded, multiPlan.cta, multiPlan.ctaLoggedIn,
          );
          const multiHref = isLoggedIn
            ? `/checkout?plan=multi&billing=${billingCycle}`
            : `/sign-up?plan=multi&billing=${billingCycle}`;
          const displayPrice = billingCycle === "annual" ? multiPlan.annualPrice : multiPlan.monthlyPrice;

          return (
            <div className="relative mt-12 rounded-[2rem] border border-gray-800 bg-gray-900 p-8 flex flex-col sm:flex-row sm:items-center gap-8 shadow-2xl overflow-visible">
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full opacity-20 blur-[100px] pointer-events-none z-0" />

              {multiPlan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg z-20">
                  {multiPlan.badge}
                </div>
              )}

              <div className="sm:w-64 shrink-0 relative z-10 break-words">
                <h2 className="text-sm font-bold uppercase tracking-widest mb-3 text-blue-400">{multiPlan.name}</h2>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-3xl lg:text-4xl font-black tracking-tight text-white">{displayPrice}</span>
                  <span className="text-sm pb-1 text-gray-400 font-medium">{multiPlan.period}</span>
                </div>
                <p className="text-[13px] text-gray-400 leading-relaxed max-w-full sm:max-w-[200px]">{multiPlan.description}</p>
              </div>

              <ul className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 relative z-10 py-4 border-y sm:border-y-0 sm:border-l border-gray-800 sm:pl-8">
                {multiPlan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-900/50 flex items-center justify-center border border-blue-500/30">
                      <Check size={12} className="text-blue-400 stroke-[3]" />
                    </span>
                    <span className="text-gray-300 font-medium">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-3 relative z-10 ml-auto pt-4 sm:pt-0">
                {multiUseUpgrade ? (
                  <UpgradeButton
                    plan="multi"
                    billingCycle={billingCycle}
                    className="px-8 py-4 rounded-xl text-sm font-bold bg-white text-gray-900 hover:bg-gray-100 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-60"
                  >
                    {multiCta}
                  </UpgradeButton>
                ) : multiUseCheckout ? (
                  <Link
                    href={`/checkout?plan=multi&billing=${billingCycle}`}
                    className="px-8 py-4 rounded-xl text-sm font-bold text-center bg-white text-gray-900 hover:bg-gray-100 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  >
                    {multiPlan.cta}
                  </Link>
                ) : (
                  <Link
                    href={multiHref}
                    aria-current={multiIsCurrent ? "page" : undefined}
                    className={`px-8 py-4 rounded-xl text-sm font-bold text-center transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)] ${
                      multiIsCurrent
                        ? "bg-gray-800 text-gray-400 cursor-default pointer-events-none shadow-none"
                        : "bg-white text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {multiCta}
                  </Link>
                )}
                <p className="text-[11px] font-medium text-center text-gray-500 mt-1">Cancel or upgrade anytime</p>
              </div>
            </div>
          );
        })()}


        {/* Fine print */}
        <p className="text-center text-sm font-medium text-gray-500 mt-10 mb-20">
          14-day free trial on all plans. Cancel anytime — no fees, no contracts.
        </p>

        {/* Competitor comparison Overhaul */}
        <div className="mt-24">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">How we compare</h2>
            <p className="text-gray-500 font-medium">Same powerful features as enterprise tools — at a fraction of the price.</p>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 overflow-hidden relative">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-5 px-6 text-gray-400 font-semibold w-[40%] text-xs uppercase tracking-widest">Feature Comparison</th>
                    <th className="py-5 px-6 text-center w-[20%] border-l border-gray-200 bg-blue-50/50">
                      <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white font-bold px-4 py-1.5 rounded-full text-xs shadow-md">
                        Salva AI
                      </span>
                    </th>
                    <th className="py-5 px-6 text-center text-gray-500 font-bold w-[20%] border-l border-gray-200">Dentina.ai</th>
                    <th className="py-5 px-6 text-center text-gray-500 font-bold w-[20%] border-l border-gray-200">DentalAI Assist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comparison.map((row, i) => (
                    <tr key={row.feature} className={`hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                      <td className="py-4 px-6 text-gray-700 font-semibold">{row.feature}</td>
                      <td className="py-4 px-6 text-center border-l border-gray-200 bg-blue-50/20">
                        <ComparisonCell value={row.salvai} highlight />
                      </td>
                      <td className="py-4 px-6 text-center border-l border-gray-200">
                        <ComparisonCell value={row.dentina} />
                      </td>
                      <td className="py-4 px-6 text-center border-l border-gray-200">
                        <ComparisonCell value={row.dentalaiassist} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] font-medium text-gray-400 text-center mt-6">
            Competitor pricing based on publicly available information. Subject to change.
          </p>
        </div>

        {/* RE-INSERTED FAQ SECTION */}
        <div className="mt-28 border-t border-gray-200 pt-20">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight text-center mb-12">
            Common questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{faq.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-10 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium text-gray-400">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Logo width={100} height={26} />
          </Link>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            <Link href="/pricing" className="hover:text-gray-800 transition-colors">Pricing</Link>
            <Link href="/faq" className="hover:text-gray-800 transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-gray-800 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-800 transition-colors">Terms</Link>
            <Link href="/baa" className="hover:text-gray-800 transition-colors">BAA</Link>
          </div>
          <span>© {new Date().getFullYear()} Salva AI</span>
        </div>
      </footer>
    </div>
  );
}

function ComparisonCell({ value, highlight = false }: { value: boolean | string; highlight?: boolean }) {
  if (value === true) {
    return (
      <div className={`mx-auto w-6 h-6 rounded-full flex items-center justify-center ${highlight ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
        <Check size={14} strokeWidth={3} />
      </div>
    );
  }
  if (value === false) {
    return <X size={16} strokeWidth={2.5} className="text-gray-300 mx-auto" />;
  }
  return <span className={`text-xs font-bold ${highlight ? "text-blue-700" : "text-gray-600"}`}>{value}</span>;
}
