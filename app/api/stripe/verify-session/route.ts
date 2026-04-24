import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { stripe, planFromPriceId, planStatusFromStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await req.json() as { sessionId: string };
  if (!sessionId) return Response.json({ error: "Missing sessionId" }, { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (session.payment_status !== "paid" && session.status !== "complete") {
    return Response.json({ error: "Payment not complete" }, { status: 400 });
  }

  const businessId = session.metadata?.businessId;
  const billingCycle = (session.metadata?.billingCycle || "annual") as "annual" | "monthly";
  if (!businessId) return Response.json({ error: "Missing businessId in session" }, { status: 400 });

  const subscription = session.subscription as import("stripe").Stripe.Subscription;
  const priceId = subscription.items.data[0].price.id;
  const plan = planFromPriceId(priceId);

  await supabaseAdmin
    .from("businesses")
    .update({
      stripe_customer_id:     session.customer as string,
      stripe_subscription_id: subscription.id,
      plan,
      billing_cycle: billingCycle,
      plan_status: planStatusFromStripe(subscription.status),
    })
    .eq("id", businessId);

  return Response.json({ plan, planStatus: subscription.status });
}
