import type { PlanType } from "@/lib/stripe";

export type PlanKey = PlanType;

export interface Plan {
  name: string;
  planKey: PlanKey;
  annualPrice: string;
  monthlyPrice: string;
  annualTotal: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaLoggedIn: string;
  href: string;
  hrefLoggedIn: string;
  highlight: boolean;
  badge: string | null;
}

export const PLANS: Plan[] = [
  {
    name: "Basic",
    planKey: "basic",
    annualPrice: "$65",
    monthlyPrice: "$79",
    annualTotal: "$780",
    period: "/ month",
    description: "Website AI chat for growing practices.",
    features: [
      "Unlimited AI chat on your website",
      "Trained on your FAQs, hours & services",
      "24/7 coverage — never sleeps",
      "Custom AI name & greeting",
      "Zero SalvaAI branding on your widget",
      "Do's & Don'ts behavior controls",
      "Conversation history & transcripts",
      "HIPAA-safe — no PHI stored",
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
    planKey: "pro",
    annualPrice: "$249",
    monthlyPrice: "$309",
    annualTotal: "$2,988",
    period: "/ month",
    description: "Never miss a patient call with 24/7 AI voice answering.",
    features: [
      "24/7 AI voice phone answering",
      "750 voice minutes / month (≈250 calls at 3 min average)",
      "Custom AI voice selection",
      "8 AI behavior toggles (instant booking, after-hours, insurance, emergency, pricing, payment plans)",
      "Missed-call inbox — emergencies, bookings, callbacks",
      "Real-time dashboard notifications",
      "Multi-channel alerts — SMS, email, WhatsApp",
      "Open Dental integration",
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
    name: "Growth",
    planKey: "growth",
    annualPrice: "$449",
    monthlyPrice: "$559",
    annualTotal: "$5,388",
    period: "/ month",
    description: "For high-volume single practices that scale fast.",
    features: [
      "Everything in Pro",
      "2,000 voice minutes / month (≈650 calls at 3 min average)",
      "Dedicated onboarding call",
      "Priority email support",
    ],
    cta: "Start 14-day free trial",
    ctaLoggedIn: "Upgrade to this plan",
    href: "/sign-up?plan=growth",
    hrefLoggedIn: "/dashboard?upgrade=growth",
    highlight: false,
    badge: null,
  },
  {
    name: "Multi-Practice",
    planKey: "multi",
    annualPrice: "$849",
    monthlyPrice: "$1,049",
    annualTotal: "$10,188",
    period: "/ month",
    description: "All locations, one platform — 57% cheaper per location than competitors.",
    features: [
      "Everything in Growth",
      "Up to 5 practice locations",
      "750 voice minutes per location (3,750 total)",
      "Centralized multi-location dashboard",
      "Per-location AI configuration",
      "Consolidated billing",
    ],
    cta: "Start 14-day free trial",
    ctaLoggedIn: "Upgrade to this plan",
    href: "/sign-up?plan=multi",
    hrefLoggedIn: "/dashboard?upgrade=multi",
    highlight: false,
    badge: "Best value",
  },
];

export function getPlan(planKey: string): Plan | undefined {
  return PLANS.find((p) => p.planKey === planKey);
}
