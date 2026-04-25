import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token || typeof token !== "string") {
    return Response.json({ error: "Missing token" }, { status: 400 });
  }

  const { data: business, error } = await supabaseAdmin
    .from("businesses")
    .select("id, clerk_user_id, stripe_subscription_id, deletion_token, deletion_requested_at")
    .eq("deletion_token", token)
    .single();

  if (error || !business) {
    return Response.json({ error: "Invalid or expired link" }, { status: 404 });
  }

  // Token expires 24h after requested_at was set
  const expiresAt = new Date(business.deletion_requested_at).getTime();
  if (Date.now() > expiresAt) {
    return Response.json({ error: "This link has expired. Please request a new deletion email." }, { status: 410 });
  }

  // Cancel Stripe subscription if active
  if (business.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(business.stripe_subscription_id);
    } catch (e) {
      console.error("Stripe cancellation error:", e);
      // Non-fatal — proceed with deletion regardless
    }
  }

  // Soft-delete: stamp deleted_at and clear the token so the link can't be reused
  const { error: softDeleteError } = await supabaseAdmin
    .from("businesses")
    .update({
      deleted_at: new Date().toISOString(),
      deletion_token: null,
      deletion_requested_at: null,
      plan: "free",
      plan_status: "canceled",
      stripe_subscription_id: null,
    })
    .eq("id", business.id);

  if (softDeleteError) {
    console.error("Soft-delete error:", softDeleteError);
    return Response.json({ error: "Deletion failed — please contact support." }, { status: 500 });
  }

  // Delete Clerk user (irreversible — last step)
  try {
    const client = await clerkClient();
    await client.users.deleteUser(business.clerk_user_id);
  } catch (e) {
    console.error("Clerk user deletion error:", e);
    // Non-fatal — account is already soft-deleted in DB
  }

  return Response.json({ ok: true });
}
