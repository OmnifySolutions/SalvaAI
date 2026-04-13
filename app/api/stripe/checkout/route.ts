import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { stripe, PRICE_IDS } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json() as { plan: "basic" | "pro" | "multi" };
  if (!PRICE_IDS[plan]) return Response.json({ error: "Invalid plan" }, { status: 400 });

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, stripe_customer_id, stripe_subscription_id, plan")
    .eq("clerk_user_id", userId)
    .single();

  if (!business) return Response.json({ error: "Business not found" }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const priceId = PRICE_IDS[plan];

  // ── Upgrade existing subscription directly (no new Checkout needed) ──────
  if (business.stripe_subscription_id) {
    const subscription = await stripe.subscriptions.retrieve(
      business.stripe_subscription_id
    );
    await stripe.subscriptions.update(business.stripe_subscription_id, {
      items: [{ id: subscription.items.data[0].id, price: priceId }],
      proration_behavior: "create_prorations",
    });
    await supabaseAdmin
      .from("businesses")
      .update({ plan })
      .eq("id", business.id);
    return Response.json({ url: `${appUrl}/dashboard?upgraded=true` });
  }

  // ── New subscription via Stripe Checkout ─────────────────────────────────
  let customerId = business.stripe_customer_id as string | null;

  if (!customerId) {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    const customer = await stripe.customers.create({
      email: email ?? undefined,
      metadata: { businessId: business.id },
    });
    customerId = customer.id;
    await supabaseAdmin
      .from("businesses")
      .update({ stripe_customer_id: customerId })
      .eq("id", business.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { businessId: business.id },
    },
    payment_method_collection: "always",
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { businessId: business.id, plan },
  });

  return Response.json({ url: session.url });
}
