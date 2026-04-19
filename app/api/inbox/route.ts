import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!business) return Response.json({ error: "Business not found" }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("id, channel, urgency, is_after_hours, appointment_requested, appointment_booked_status, callback_requested, visitor_name, visitor_phone, visitor_email, summary, appointment_notes, created_at")
    .eq("business_id", business.id)
    .is("resolved_at", null)
    .or("urgency.eq.emergency,and(appointment_requested.eq.true,appointment_booked_status.neq.confirmed),callback_requested.eq.true")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: "Failed to fetch inbox" }, { status: 500 });

  // Sort: emergencies first, then pending bookings, then callbacks
  const sorted = (data ?? []).sort((a, b) => {
    const priority = (c: typeof a) => {
      if (c.urgency === "emergency") return 0;
      if (c.appointment_requested && c.appointment_booked_status !== "confirmed") return 1;
      return 2;
    };
    return priority(a) - priority(b);
  });

  return Response.json({ items: sorted });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await req.json();
  if (!conversationId) return Response.json({ error: "Missing conversationId" }, { status: 400 });

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!business) return Response.json({ error: "Business not found" }, { status: 404 });

  // Verify ownership before resolving
  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("business_id")
    .eq("id", conversationId)
    .single();

  if (!conv || conv.business_id !== business.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("conversations")
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (error) return Response.json({ error: "Failed to resolve" }, { status: 500 });

  return Response.json({ ok: true });
}
