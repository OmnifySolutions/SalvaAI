import { NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe, planFromPriceId, planStatusFromStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { promoteToOrganization } from "@/lib/organizations";

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

        const { data: updatedBiz, error: dbErr } = await supabaseAdmin
          .from("businesses")
          .update({
            stripe_customer_id:      session.customer as string,
            stripe_subscription_id:  session.subscription as string,
            plan,
            billing_cycle: billingCycle,
            plan_status: planStatusFromStripe(subscription.status),
          })
          .eq("id", businessId)
          .select("id, name, clerk_user_id, stripe_customer_id, stripe_subscription_id")
          .single();
        if (dbErr) throw new Error(`DB update failed: ${dbErr.message}`);

        // Auto-create org for multi-practice upgrades (idempotent)
        if (plan === "multi" && updatedBiz) {
          try {
            await promoteToOrganization(updatedBiz.clerk_user_id, {
              id: updatedBiz.id,
              name: updatedBiz.name,
              stripe_customer_id: updatedBiz.stripe_customer_id,
              stripe_subscription_id: updatedBiz.stripe_subscription_id,
              billing_cycle: billingCycle,
            });
          } catch (orgErr) {
            console.error("Failed to promote to organization:", orgErr);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0].price.id;
        const plan    = planFromPriceId(priceId);
        // Stripe uses cancel_at (not cancel_at_period_end) for trial cancellations — it sets
        // cancel_at to the trial end date while status stays "trialing". Check both.
        const isCanceling = sub.cancel_at_period_end || sub.cancel_at !== null;
        const planStatus = isCanceling ? "canceled" : planStatusFromStripe(sub.status);

        await Promise.all([
          supabaseAdmin
            .from("businesses")
            .update({ plan, plan_status: planStatus })
            .eq("stripe_customer_id", sub.customer as string),
          // Sync status to org row if it exists
          supabaseAdmin
            .from("organizations")
            .update({ plan_status: planStatus })
            .eq("stripe_customer_id", sub.customer as string),
        ]);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        // Keep `plan` intact so win-back messaging can reference what they had.
        // Access is gated by plan_status === "canceled", not by plan value.
        await Promise.all([
          supabaseAdmin
            .from("businesses")
            .update({ plan_status: "canceled", stripe_subscription_id: null, current_period_end: null })
            .eq("stripe_customer_id", sub.customer as string),
          supabaseAdmin
            .from("organizations")
            .update({ plan_status: "canceled" })
            .eq("stripe_customer_id", sub.customer as string),
        ]);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await supabaseAdmin
          .from("businesses")
          .update({ plan_status: "past_due", payment_failed_at: new Date().toISOString() })
          .eq("stripe_customer_id", invoice.customer as string);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // Clear failure state when Stripe successfully retries payment
        await supabaseAdmin
          .from("businesses")
          .update({ plan_status: "active", payment_failed_at: null })
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
