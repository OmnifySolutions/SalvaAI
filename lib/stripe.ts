import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export type PlanType = "basic" | "pro" | "growth" | "multi";
export type BillingCycle = "annual" | "monthly";

export const PRICE_IDS: Record<PlanType, Record<BillingCycle, string>> = {
  basic: {
    annual:  process.env.STRIPE_BASIC_ANNUAL_PRICE_ID!,
    monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID!,
  },
  pro: {
    annual:  process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  },
  growth: {
    annual:  process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID!,
    monthly: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID!,
  },
  multi: {
    annual:  process.env.STRIPE_MULTI_ANNUAL_PRICE_ID!,
    monthly: process.env.STRIPE_MULTI_MONTHLY_PRICE_ID!,
  },
};

export function planFromPriceId(priceId: string): PlanType | "free" {
  // Check all price IDs to find matching plan
  for (const [plan, cycles] of Object.entries(PRICE_IDS)) {
    for (const [, priceIdValue] of Object.entries(cycles)) {
      if (priceIdValue === priceId) {
        return plan as PlanType;
      }
    }
  }
  return "free";
}

/** Maps a Stripe subscription status to our plan_status column value. */
export function planStatusFromStripe(status: Stripe.Subscription.Status): string {
  return status; // 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' etc.
}
