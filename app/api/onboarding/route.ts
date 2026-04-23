import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base || "practice";
  let attempt = 0;
  while (true) {
    const slug = attempt === 0 ? candidate : `${candidate}-${attempt}`;
    const { data } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    attempt++;
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    businessName,
    businessType,
    hours,
    services,
    aiName,
    aiGreeting,
    notifyEmergencyPhone,
    notifyEmergencyEmail,
    opendentalServerUrl,
    opendentalApiKey,
  } = body;

  if (!businessName?.trim()) {
    return Response.json({ error: "Business name required" }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (existing) {
    return Response.json({ businessId: existing.id });
  }

  const slug = await uniqueSlug(makeSlug(businessName));

  const { data, error } = await supabaseAdmin
    .from("businesses")
    .insert({
      clerk_user_id: userId,
      name: businessName.trim(),
      slug,
      business_type: businessType ?? "dental",
      hours: hours ?? null,
      services: Array.isArray(services) ? services : [],
      ai_name: aiName?.trim() || "Claire",
      ai_greeting: aiGreeting?.trim() || null,
      notify_on_emergency: true,
      notify_emergency_phone: notifyEmergencyPhone || null,
      notify_emergency_email: notifyEmergencyEmail || null,
      opendental_server_url: opendentalServerUrl || null,
      opendental_api_key: opendentalApiKey || null,
      plan: "free",
      plan_status: "active",
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
