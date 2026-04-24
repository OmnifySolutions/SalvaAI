import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe, PRICE_IDS, type PlanType, type BillingCycle } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const [{ userId }, user, body] = await Promise.all([auth(), currentUser(), req.json()]);
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { plan, billingCycle = "annual" } = body as {
      plan: PlanType;
      billingCycle?: BillingCycle;
    };

    if (!plan || !PRICE_IDS[plan]?.[billingCycle]) {
      return Response.json({ error: "Invalid plan or billing cycle" }, { status: 400 });
    }

    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .select("id, stripe_customer_id, stripe_subscription_id")
      .eq("clerk_user_id", userId)
      .single();

    if (bizError || !business) {
      return Response.json({ error: "Business not found" }, { status: 404 });
    }

    // Validate or create Stripe customer
    let customerId = business.stripe_customer_id as string | null;
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch {
        customerId = null;
        supabaseAdmin
          .from("businesses")
          .update({ stripe_customer_id: null, stripe_subscription_id: null })
          .eq("id", business.id)
          .then(({ error }) => { if (error) console.error("Failed to reset customer ID:", error); });
      }
    }

    if (!customerId) {
      const email = user?.emailAddresses[0]?.emailAddress;
      const customer = await stripe.customers.create({
        email: email ?? undefined,
        metadata: { businessId: business.id },
      });
      customerId = customer.id;
      const { error: updateError } = await supabaseAdmin
        .from("businesses")
        .update({ stripe_customer_id: customerId })
        .eq("id", business.id);
      if (updateError) console.error("Failed to save customer ID:", updateError);
    }

    const priceId = PRICE_IDS[plan][billingCycle];

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: 14,
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["pending_setup_intent"],
      metadata: { businessId: business.id, plan, billingCycle },
    });

    const setupIntent = subscription.pending_setup_intent as import("stripe").Stripe.SetupIntent;

    if (!setupIntent?.client_secret) {
      return Response.json({ error: "Failed to create setup intent" }, { status: 500 });
    }

    return Response.json({
      clientSecret: setupIntent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("create-subscription-intent error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
