import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessName, businessType, hours, services } = await req.json();
  if (!businessName) {
    return Response.json({ error: "Business name required" }, { status: 400 });
  }

  // Check if already onboarded
  const { data: existing } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (existing) {
    return Response.json({ businessId: existing.id });
  }

  const { data, error } = await supabaseAdmin
    .from("businesses")
    .insert({
      clerk_user_id: userId,
      business_name: businessName,
      business_type: businessType ?? "dental",
      hours: hours ?? "",
      services: services ?? "",
      plan: "trial",
      faqs: [],
      interaction_count: 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Onboarding error:", error);
    return Response.json({ error: "Failed to create business" }, { status: 500 });
  }

  return Response.json({ businessId: data.id });
}
