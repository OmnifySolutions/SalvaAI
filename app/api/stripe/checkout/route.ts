import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { stripe, PRICE_IDS, type PlanType, type BillingCycle } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { plan, billingCycle = "annual" } = await req.json() as { plan: PlanType; billingCycle?: BillingCycle };

    if (!plan || !PRICE_IDS[plan] || !PRICE_IDS[plan][billingCycle]) {
      return Response.json({ error: "Invalid plan or billing cycle" }, { status: 400 });
    }

    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("id, stripe_customer_id, stripe_subscription_id, plan")
      .eq("clerk_user_id", userId)
      .single();

    if (!business) return Response.json({ error: "Business not found" }, { status: 404 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const priceId = PRICE_IDS[plan][billingCycle];

    // ── Upgrade existing subscription directly (no new Checkout needed) ──────
    if (business.stripe_subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          business.stripe_subscription_id
        );
        await stripe.subscriptions.update(business.stripe_subscription_id, {
          items: [{ id: subscription.items.data[0].id, price: priceId }],
          proration_behavior: "create_prorations",
        });
        await supabaseAdmin
          .from("businesses")
          .update({ plan, billing_cycle: billingCycle })
          .eq("id", business.id);
        return Response.json({ url: `${appUrl}/payment-success` });
      } catch {
        // Subscription belongs to a different Stripe mode — fall through to new checkout
        await supabaseAdmin
          .from("businesses")
          .update({ stripe_customer_id: null, stripe_subscription_id: null })
          .eq("id", business.id);
        business.stripe_customer_id = null;
      }
    }

    // ── New subscription via Stripe Checkout ─────────────────────────────────
    let customerId = business.stripe_customer_id as string | null;

    // Validate the stored customer still exists in the current Stripe mode
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch {
        // Customer belongs to a different Stripe mode (live vs test) — reset it
        customerId = null;
        await supabaseAdmin
          .from("businesses")
          .update({ stripe_customer_id: null, stripe_subscription_id: null })
          .eq("id", business.id);
      }
    }

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
        metadata: { businessId: business.id, plan, billingCycle },
      },
      payment_method_collection: "always",
      success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { businessId: business.id, plan, billingCycle },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
