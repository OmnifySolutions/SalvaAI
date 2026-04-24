import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getOrganization, deleteLocation } from "@/lib/organizations";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: locationId } = await params;

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("plan")
    .eq("clerk_user_id", userId)
    .single();

  if (!business || business.plan !== "multi") {
    return NextResponse.json({ error: "Multi-Practice plan required" }, { status: 403 });
  }

  const org = await getOrganization(userId);
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  try {
    await deleteLocation(org.id, locationId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete location";
    const status = message.includes("primary") ? 400 : message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
