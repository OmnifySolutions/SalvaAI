import { NextRequest } from "next/server";
import { stripe, planFromPriceId, planStatusFromStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

// Public — no Clerk auth required. The subscriptionId being retrievable from Stripe
// and containing a businessId in metadata is sufficient proof.
export async function POST(req: NextRequest) {
  const { subscriptionId } = (await req.json()) as { subscriptionId?: string };
  if (!subscriptionId) {
    return Response.json({ error: "Missing subscriptionId" }, { status: 400 });
  }

  let subscription: import("stripe").Stripe.Subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["customer"],
    });
  } catch {
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const businessId = subscription.metadata?.businessId;
  if (!businessId) {
    return Response.json({ error: "Missing businessId in subscription metadata" }, { status: 400 });
  }

  if (!subscription.items?.data?.[0]) {
    return Response.json({ error: "No subscription items found" }, { status: 400 });
  }

  const priceId = subscription.items.data[0].price.id;
  const plan = planFromPriceId(priceId);
  const billingCycle = (subscription.metadata?.billingCycle || "annual") as "annual" | "monthly";
  const customer = subscription.customer as import("stripe").Stripe.Customer;

  const { error: dbError } = await supabaseAdmin
    .from("businesses")
    .update({
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      plan,
      billing_cycle: billingCycle,
      plan_status: planStatusFromStripe(subscription.status),
    })
    .eq("id", businessId);

  if (dbError) {
    console.error("verify-subscription db error:", dbError);
    return Response.json({ error: "Database update failed" }, { status: 500 });
  }

  return Response.json({ plan, planStatus: subscription.status });
}
