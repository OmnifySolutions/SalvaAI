import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Check, X } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import UpgradeButton from "@/components/UpgradeButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dental AI Receptionist Pricing — Plans & Comparison",
  description:
    "Simple, transparent pricing for dental AI receptionists. Start with 50 free interactions — no credit card required. Paid plans include a 14-day free trial.",
  alternates: { canonical: "/pricing" },
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try it risk-free with your first 50 patient interactions.",
    features: [
      "50 AI interactions total",
      "Chat widget",
      "Basic FAQ support",
      "Salva AI branding",
    ],
    cta: "Get started free",
    ctaLoggedIn: "Go to dashboard",
    href: "/sign-up",
    hrefLoggedIn: "/dashboard",
    highlight: false,
    badge: null,
  },
  {
    name: "Basic",
    price: "$69",
    period: "/ month",
    description: "For growing practices that want to capture every opportunity.",
    features: [
      "Unlimited AI interactions",
      "Chat widget — no branding",
      "Custom AI name & greeting",
      "FAQ management",
      "Conversation history",
      "Email support",
    ],
    cta: "Start 14-day free trial",
    ctaLoggedIn: "Upgrade to this plan",
    href: "/sign-up?plan=basic",
    hrefLoggedIn: "/dashboard?upgrade=basic",
    highlight: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "$219",
    period: "/ month",
    description: "For busy practices that can't afford to miss a single call.",
    features: [
      "Everything in Basic",
      "AI voice phone answering",
      "Up to 500 calls / month",
      "Custom AI instructions",
      "Priority support",
    ],
    cta: "Start 14-day free trial",
    ctaLoggedIn: "Upgrade to this plan",
    href: "/sign-up?plan=pro",
    hrefLoggedIn: "/dashboard?upgrade=pro",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Multi-Practice",
    price: "$749",
    period: "/ month",
    description: "One AI platform across all your locations — at a fraction of buying 5 Pro plans.",
    features: [
      "Up to 5 locations",
      "Everything in Pro",
      "Up to 2,500 calls / month",
      "Centralized dashboard",
      "Dedicated onboarding support",
    ],
    cta: "Start 14-day free trial",
    ctaLoggedIn: "Upgrade to this plan",
    href: "/sign-up?plan=multi",
    hrefLoggedIn: "/dashboard?upgrade=multi",
    highlight: false,
    badge: "Best value",
  },
];

const comparison = [
  {
    feature: "Starting price",
    hustle: "$69 / mo",
    arini: "$249 / mo",
    truelark: "$345 / mo",
  },
  {
    feature: "Voice AI answering",
    hustle: "Pro · $219/mo",
    arini: "$249 / mo",
    truelark: "$345 / mo",
  },
  {
    feature: "AI chat widget",
    hustle: true,
    arini: true,
    truelark: true,
  },
  {
    feature: "After-hours coverage",
    hustle: true,
    arini: true,
    truelark: true,
  },
  {
    feature: "Multi-location support",
    hustle: "$749 / mo (5 locations)",
    arini: false,
    truelark: false,
  },
  {
    feature: "No vendor branding",
    hustle: "Basic+",
    arini: false,
    truelark: true,
  },
  {
    feature: "14-day free trial",
    hustle: true,
    arini: false,
    truelark: false,
  },
  {
    feature: "Setup time",
    hustle: "Under 5 min",
    arini: "Several hours",
    truelark: "Several hours",
  },
];

const faqs = [
  {
    q: "Do I need a developer to set this up?",
    a: "No. You copy one line of code and paste it into your website before the closing </body> tag. Most practice managers can do it in under 5 minutes.",
  },
  {
    q: "What happens when the Free plan's 50 interaction limit is reached?",
    a: "Once your 50-interaction trial is used, the widget lets patients know to call the office directly. Upgrade to Basic or Pro for unlimited interactions.",
  },
  {
    q: "Is patient data safe?",
    a: "Yes. We never collect or store personal health information. The widget only handles general questions — it directs patients to call for anything clinical.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no cancellation fees. Upgrade or cancel from your dashboard whenever you want.",
  },
  {
    q: "Is a Business Associate Agreement (BAA) available?",
    a: "Yes. A BAA is available on Pro and Multi-Practice plans. Contact us after signing up and we'll send one over.",
  },
];

export default async function PricingPage() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  let currentPlan: "free" | "basic" | "pro" | "multi" = "free";
  if (isLoggedIn) {
    const { data } = await supabaseAdmin
      .from("businesses")
      .select("plan")
      .eq("clerk_user_id", userId)
      .maybeSingle();
    currentPlan = (data?.plan as typeof currentPlan) ?? "free";
  }

  const multiPlan = plans.find((p) => p.name === "Multi-Practice")!;
  const multiIsCurrent = (currentPlan as string) === "multi";
  const multiUseUpgrade = isLoggedIn && !multiIsCurrent;
  const multiCta = multiIsCurrent ? "Current plan" : isLoggedIn ? multiPlan.ctaLoggedIn : multiPlan.cta;
  const multiHref = isLoggedIn ? multiPlan.hrefLoggedIn : multiPlan.href;

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
            <Link href="/" className="font-bold text-gray-900 text-lg tracking-tight">Salva AI</Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
              <Link href="/how-it-works" className="hover:text-gray-800 transition-colors">How it works</Link>
              <Link href="/pricing" className="text-gray-900 font-medium">Pricing</Link>
              <Link href="/#features" className="hover:text-gray-800 transition-colors">Features</Link>
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
                  href="/sign-up"
                  className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Get started free
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
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            One missed new-patient call is worth more than a month of Salva AI.
          </p>
        </div>

        {/* Plans — Free / Basic / Pro row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.filter((p) => p.name !== "Multi-Practice").map((plan) => {
            const isPaid = plan.name !== "Free";
            const planKey = plan.name.toLowerCase() as "free" | "basic" | "pro";
            const isCurrent = isLoggedIn && currentPlan === planKey;
            const useUpgrade = isLoggedIn && isPaid && !isCurrent;
            const cta = isCurrent ? "Current plan" : isLoggedIn ? plan.ctaLoggedIn : plan.cta;
            const href = isLoggedIn ? plan.hrefLoggedIn : plan.href;

            // Notice the h-full flex flex-col to force equal heights!
            return (
              <div
                key={plan.name}
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
                      {plan.price}
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
                      plan={planKey as "basic" | "pro"}
                      className={`w-full py-4 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 ${
                        plan.highlight
                          ? "bg-white text-gray-900 hover:bg-gray-100 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                          : "bg-gray-900 text-white hover:bg-gray-700 shadow-lg"
                      }`}
                    >
                      {cta}
                    </UpgradeButton>
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
                    {isPaid ? (
                      <p className={`text-[11px] font-medium text-center ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                        Upgrade or cancel anytime
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-Practice — full-width horizontal card overhauled */}
        <div className="relative mt-12 rounded-[2rem] border border-gray-800 bg-gray-900 p-8 flex flex-col sm:flex-row sm:items-center gap-8 shadow-2xl overflow-visible">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full opacity-20 blur-[100px] pointer-events-none z-0" />
          
          {multiPlan.badge && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg z-20">
              {multiPlan.badge}
            </div>
          )}
          
          <div className="sm:w-64 shrink-0 relative z-10 break-words">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-3 text-blue-400">Multi-Practice</h2>
            <div className="flex items-end gap-1 mb-3">
              <span className="text-3xl lg:text-4xl font-black tracking-tight text-white">{multiPlan.price}</span>
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
                className="px-8 py-4 rounded-xl text-sm font-bold bg-white text-gray-900 hover:bg-gray-100 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-60"
              >
                {multiCta}
              </UpgradeButton>
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
            <p className="text-[11px] font-medium text-center text-gray-500 mt-1">Upgrade or cancel anytime</p>
          </div>
        </div>

        {/* Fine print */}
        <p className="text-center text-sm font-medium text-gray-500 mt-10 mb-20">
          14-day free trial included with all paid plans. Cancel anytime — no fees.
        </p>

        {/* Competitor comparison Overhaul */}
        <div className="mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">How we compare</h2>
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
                    <th className="py-5 px-6 text-center text-gray-500 font-bold w-[20%] border-l border-gray-200">Arini</th>
                    <th className="py-5 px-6 text-center text-gray-500 font-bold w-[20%] border-l border-gray-200">TrueLark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comparison.map((row, i) => (
                    <tr key={row.feature} className={`hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                      <td className="py-4 px-6 text-gray-700 font-semibold">{row.feature}</td>
                      <td className="py-4 px-6 text-center border-l border-gray-200 bg-blue-50/20">
                        <ComparisonCell value={row.hustle} highlight />
                      </td>
                      <td className="py-4 px-6 text-center border-l border-gray-200">
                        <ComparisonCell value={row.arini} />
                      </td>
                      <td className="py-4 px-6 text-center border-l border-gray-200">
                        <ComparisonCell value={row.truelark} />
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
          <h2 className="text-3xl font-black text-gray-900 tracking-tight text-center mb-12">
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
          <Link href="/" className="font-bold text-gray-900 tracking-tight text-lg">Salva AI</Link>
          <div className="flex gap-8">
            <Link href="/pricing" className="hover:text-gray-800 transition-colors">Pricing</Link>
            <Link href="/sign-in" className="hover:text-gray-800 transition-colors">Sign in</Link>
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
