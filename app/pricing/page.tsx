import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Check, X } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import UpgradeButton from "@/components/UpgradeButton";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try it risk-free with your first 50 patient interactions.",
    features: [
      "50 AI interactions / month",
      "Chat widget",
      "Basic FAQ support",
      "HustleClaude branding",
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
    price: "$49",
    period: "/ month",
    description: "For growing practices that want to capture every opportunity.",
    features: [
      "500 AI interactions / month",
      "Chat widget — no branding",
      "Custom AI name & greeting",
      "FAQ management",
      "Conversation history",
      "Email support",
    ],
    cta: "Start free trial",
    ctaLoggedIn: "Upgrade to this plan",
    href: "/sign-up?plan=basic",
    hrefLoggedIn: "/dashboard?upgrade=basic",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Pro",
    price: "$149",
    period: "/ month",
    description: "For busy practices that can't afford to miss a single call.",
    features: [
      "Unlimited AI interactions",
      "Everything in Basic",
      "AI voice phone answering",
      "Custom AI instructions",
      "Priority support",
    ],
    cta: "Start free trial",
    ctaLoggedIn: "Upgrade to this plan",
    href: "/sign-up?plan=pro",
    hrefLoggedIn: "/dashboard?upgrade=pro",
    highlight: false,
    badge: null,
  },
];

const comparison = [
  {
    feature: "Starting price",
    hustle: "$49 / mo",
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
    feature: "AI voice answering",
    hustle: "Pro plan",
    arini: true,
    truelark: true,
  },
  {
    feature: "No vendor branding",
    hustle: "Basic+",
    arini: false,
    truelark: true,
  },
  {
    feature: "30-day free trial",
    hustle: true,
    arini: false,
    truelark: false,
  },
  {
    feature: "Setup time",
    hustle: "2 minutes",
    arini: "Several hours",
    truelark: "Several hours",
  },
];

export default async function PricingPage() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  let currentPlan: "free" | "basic" | "pro" = "free";
  if (isLoggedIn) {
    const { data } = await supabaseAdmin
      .from("businesses")
      .select("plan")
      .eq("clerk_user_id", userId)
      .maybeSingle();
    currentPlan = (data?.plan as typeof currentPlan) ?? "free";
  }

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "var(--font-geist-sans)" }}>

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-gray-900 text-lg tracking-tight">HustleClaude</Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
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
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            One missed new-patient call is worth more than a month of HustleClaude.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isPaid = plan.name !== "Free";
            const planKey = plan.name.toLowerCase() as "free" | "basic" | "pro";
            const isCurrent = isLoggedIn && currentPlan === planKey;
            const useUpgrade = isLoggedIn && isPaid && !isCurrent;
            const cta = isCurrent ? "Current plan" : isLoggedIn ? plan.ctaLoggedIn : plan.cta;
            const href = isLoggedIn ? plan.hrefLoggedIn : plan.href;

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.highlight
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-5">
                  <h2 className="text-sm font-semibold uppercase tracking-widest mb-3 text-gray-400">
                    {plan.name}
                  </h2>
                  <div className="flex items-end gap-1 mb-3">
                    <span className={`text-4xl font-bold tracking-tight ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                      {plan.price}
                    </span>
                    <span className="text-sm pb-1.5 text-gray-400">
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className={`shrink-0 mt-0.5 font-bold ${plan.highlight ? "text-blue-400" : "text-blue-600"}`}>✓</span>
                      <span className={plan.highlight ? "text-gray-300" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                {useUpgrade ? (
                  <UpgradeButton
                    plan={planKey as "basic" | "pro"}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                      plan.highlight
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : "bg-gray-900 text-white hover:bg-gray-700"
                    }`}
                  >
                    {cta}
                  </UpgradeButton>
                ) : (
                  <Link
                    href={href}
                    aria-disabled={isCurrent}
                    className={`block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isCurrent
                        ? "bg-gray-100 text-gray-400 cursor-default pointer-events-none"
                        : plan.highlight
                          ? "bg-white text-gray-900 hover:bg-gray-100"
                          : "bg-gray-900 text-white hover:bg-gray-700"
                    }`}
                  >
                    {cta}
                  </Link>
                )}

                {isPaid && (
                  <p className={`text-xs text-center mt-2.5 ${plan.highlight ? "text-gray-500" : "text-gray-400"}`}>
                    Upgrade or cancel anytime
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Fine print */}
        <p className="text-center text-sm text-gray-400 mt-10">
          All paid plans start with a 30-day free trial. No credit card required to start.
        </p>

        {/* Competitor comparison */}
        <div className="mt-20 border-t border-gray-100 pt-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">How we compare</h2>
            <p className="text-gray-500 text-sm">Same features as enterprise tools — at a fraction of the price.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium w-[38%]" />
                  <th className="py-3 px-4 text-center w-[20%]">
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full text-xs">
                      HustleClaude
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center text-gray-500 font-medium w-[20%]">Arini</th>
                  <th className="py-3 px-4 text-center text-gray-500 font-medium w-[20%]">TrueLark</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="py-3 px-4 text-gray-600 font-medium rounded-l-lg">{row.feature}</td>
                    <td className="py-3 px-4 text-center rounded-none">
                      <ComparisonCell value={row.hustle} highlight />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <ComparisonCell value={row.arini} />
                    </td>
                    <td className="py-3 px-4 text-center rounded-r-lg">
                      <ComparisonCell value={row.truelark} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Competitor pricing based on publicly available information. Subject to change.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-20 border-t border-gray-100 pt-14">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight text-center mb-8">
            Common questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-medium text-gray-900 mb-1.5 text-sm">{faq.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <Link href="/" className="font-semibold text-gray-700">HustleClaude</Link>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-600 transition-colors">Pricing</Link>
            <Link href="/sign-in" className="hover:text-gray-600 transition-colors">Sign in</Link>
          </div>
          <span>© {new Date().getFullYear()} HustleClaude</span>
        </div>
      </footer>
    </div>
  );
}

function ComparisonCell({ value, highlight = false }: { value: boolean | string; highlight?: boolean }) {
  if (value === true) {
    return <Check size={16} strokeWidth={2.5} className={highlight ? "text-blue-600 mx-auto" : "text-gray-400 mx-auto"} />;
  }
  if (value === false) {
    return <X size={16} strokeWidth={2.5} className="text-gray-300 mx-auto" />;
  }
  return <span className={`text-xs font-medium ${highlight ? "text-blue-700" : "text-gray-500"}`}>{value}</span>;
}

const faqs = [
  {
    q: "Do I need a developer to set this up?",
    a: "No. You copy one line of code and paste it into your website before the closing </body> tag. Most practice managers can do it in under 5 minutes.",
  },
  {
    q: "What happens when I hit the interaction limit?",
    a: "The widget lets patients know to call the office directly. You can upgrade at any time to restore full access.",
  },
  {
    q: "Is patient data safe?",
    a: "Yes. We never collect or store personal health information. The widget only handles general questions — it directs patients to call for anything clinical.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no cancellation fees. Upgrade or cancel from your dashboard whenever you want.",
  },
];
