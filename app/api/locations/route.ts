import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  getOrganization,
  getOrgLocations,
  createLocation,
  MAX_LOCATIONS,
} from "@/lib/organizations";

async function getCallerBusiness(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("businesses")
    .select("id, name, plan, organization_id")
    .eq("clerk_user_id", userId)
    .single();
  if (error || !data) return null;
  return data;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getCallerBusiness(userId);
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (business.plan !== "multi") return NextResponse.json({ error: "Multi-Practice plan required" }, { status: 403 });

  const org = await getOrganization(userId);
  if (!org) return NextResponse.json({ locations: [] });

  const locations = await getOrgLocations(org.id);
  return NextResponse.json({ locations, orgId: org.id, maxLocations: MAX_LOCATIONS });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await getCallerBusiness(userId);
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (business.plan !== "multi") return NextResponse.json({ error: "Multi-Practice plan required" }, { status: 403 });

  const org = await getOrganization(userId);
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  let body: { name?: string; business_type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Location name is required" }, { status: 400 });
  }

  try {
    const location = await createLocation(org.id, {
      name: body.name.trim(),
      business_type: body.business_type,
      clerk_user_id: userId,
    });
    return NextResponse.json({ location }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create location";
    const status = message.includes("Maximum") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
