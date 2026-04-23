import { NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe, planFromPriceId, planStatusFromStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) return new Response("Missing stripe-signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  try {
    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessId = session.metadata?.businessId;
        const billingCycle = (session.metadata?.billingCycle || "monthly") as "annual" | "monthly";
        if (!businessId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0].price.id;
        const plan    = planFromPriceId(priceId);

        await supabaseAdmin
          .from("businesses")
          .update({
            stripe_customer_id:      session.customer as string,
            stripe_subscription_id:  session.subscription as string,
            plan,
            billing_cycle: billingCycle,
            plan_status: planStatusFromStripe(subscription.status),
          })
          .eq("id", businessId);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0].price.id;
        const plan    = planFromPriceId(priceId);

        await supabaseAdmin
          .from("businesses")
          .update({
            plan,
            plan_status: planStatusFromStripe(sub.status),
          })
          .eq("stripe_customer_id", sub.customer as string);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from("businesses")
          .update({
            plan:                    "free",
            plan_status:             "active",
            stripe_subscription_id:  null,
          })
          .eq("stripe_customer_id", sub.customer as string);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await supabaseAdmin
          .from("businesses")
          .update({ plan_status: "past_due" })
          .eq("stripe_customer_id", invoice.customer as string);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("ok");
}
