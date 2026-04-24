import { NextRequest } from "next/server";
import { stripe, planFromPriceId, planStatusFromStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

// No Clerk auth required — businessId in Stripe session metadata is the proof of ownership.
// This must stay public so it works even if the Clerk session cookie is still loading.
export async function POST(req: NextRequest) {
  const { sessionId } = await req.json() as { sessionId?: string };
  if (!sessionId) return Response.json({ error: "Missing sessionId" }, { status: 400 });

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
  } catch {
    return Response.json({ error: "Invalid session" }, { status: 400 });
  }

  if (session.status !== "complete") {
    return Response.json({ error: "Session not complete" }, { status: 400 });
  }

  const businessId = session.metadata?.businessId;
  const billingCycle = (session.metadata?.billingCycle || "annual") as "annual" | "monthly";
  if (!businessId) return Response.json({ error: "Missing businessId in session" }, { status: 400 });

  const subscription = session.subscription as import("stripe").Stripe.Subscription;
  if (!subscription?.items?.data?.[0]) {
    return Response.json({ error: "No subscription found" }, { status: 400 });
  }

  const priceId = subscription.items.data[0].price.id;
  const plan = planFromPriceId(priceId);

  const { error: dbError } = await supabaseAdmin
    .from("businesses")
    .update({
      stripe_customer_id:     session.customer as string,
      stripe_subscription_id: subscription.id,
      plan,
      billing_cycle: billingCycle,
      plan_status: planStatusFromStripe(subscription.status),
    })
    .eq("id", businessId);

  if (dbError) {
    console.error("verify-session db error:", dbError);
    return Response.json({ error: "Database update failed" }, { status: 500 });
  }

  return Response.json({ plan, planStatus: subscription.status });
}
