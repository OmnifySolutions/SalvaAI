import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getOrganization, getOrgLocations, verifyLocationOwnership } from "@/lib/organizations";
import { sortByPriority } from "@/lib/inbox-utils";
import { NextRequest } from "next/server";

const INBOX_SELECT =
  "id, channel, urgency, is_after_hours, appointment_requested, appointment_booked_status, callback_requested, visitor_name, visitor_phone, visitor_email, summary, appointment_notes, location_name, created_at";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, plan")
    .eq("clerk_user_id", userId)
    .single();

  if (!business) return Response.json({ error: "Business not found" }, { status: 404 });

  // Multi-practice: query across all org locations
  if (business.plan === "multi") {
    const org = await getOrganization(userId);
    if (org) {
      const locations = await getOrgLocations(org.id);
      const locationIds = locations.map((l) => l.id);

      if (locationIds.length > 0) {
        const { data, error } = await supabaseAdmin
          .from("conversations")
          .select(INBOX_SELECT)
          .in("business_id", locationIds)
          .is("resolved_at", null)
          .or("urgency.eq.emergency,and(appointment_requested.eq.true,appointment_booked_status.neq.confirmed),callback_requested.eq.true")
          .order("created_at", { ascending: false });

        if (error) return Response.json({ error: "Failed to fetch inbox" }, { status: 500 });
        return Response.json({ items: sortByPriority(data ?? []) });
      }
    }
  }

  // Single-practice (or multi with no org yet): existing behavior
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select(INBOX_SELECT)
    .eq("business_id", business.id)
    .is("resolved_at", null)
    .or("urgency.eq.emergency,and(appointment_requested.eq.true,appointment_booked_status.neq.confirmed),callback_requested.eq.true")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: "Failed to fetch inbox" }, { status: 500 });

  return Response.json({ items: sortByPriority(data ?? []) });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await req.json();
  if (!conversationId) return Response.json({ error: "Missing conversationId" }, { status: 400 });

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, plan")
    .eq("clerk_user_id", userId)
    .single();

  if (!business) return Response.json({ error: "Business not found" }, { status: 404 });

  // Verify ownership before resolving
  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("business_id")
    .eq("id", conversationId)
    .single();

  if (!conv) return Response.json({ error: "Not found" }, { status: 404 });

  // For multi-plan, verify the conversation belongs to one of the org's locations
  if (business.plan === "multi") {
    const { owned } = await verifyLocationOwnership(userId, conv.business_id);
    if (!owned) return Response.json({ error: "Not found" }, { status: 404 });
  } else if (conv.business_id !== business.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("conversations")
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (error) return Response.json({ error: "Failed to resolve" }, { status: 500 });

  return Response.json({ ok: true });
}
