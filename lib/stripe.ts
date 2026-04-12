import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PRICE_IDS: Record<"basic" | "pro" | "multi", string> = {
  basic: process.env.STRIPE_BASIC_PRICE_ID!,
  pro:   process.env.STRIPE_PRO_PRICE_ID!,
  multi: process.env.STRIPE_MULTI_PRICE_ID!,
};

export function planFromPriceId(priceId: string): "basic" | "pro" | "multi" | "free" {
  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return "basic";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID)   return "pro";
  if (priceId === process.env.STRIPE_MULTI_PRICE_ID) return "multi";
  return "free";
}

/** Maps a Stripe subscription status to our plan_status column value. */
export function planStatusFromStripe(status: Stripe.Subscription.Status): string {
  return status; // 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' etc.
}
