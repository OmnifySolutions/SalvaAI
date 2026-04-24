import { supabaseAdmin } from "./supabase";
import type { Business, Organization } from "./supabase";

export const MAX_LOCATIONS = 5;

export async function getOrganization(
  clerkUserId: string
): Promise<Organization | null> {
  const { data } = await supabaseAdmin
    .from("organizations")
    .select("*")
    .eq("owner_clerk_user_id", clerkUserId)
    .maybeSingle();
  return data ?? null;
}

export async function getOrgLocations(orgId: string): Promise<Business[]> {
  const { data, error } = await supabaseAdmin
    .from("businesses")
    .select("*")
    .eq("organization_id", orgId)
    .order("is_primary_location", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createLocation(
  orgId: string,
  payload: {
    name: string;
    business_type?: string;
    clerk_user_id: string;
  }
): Promise<Business> {
  // Enforce max locations
  const existing = await getOrgLocations(orgId);
  if (existing.length >= MAX_LOCATIONS) {
    throw new Error(`Maximum of ${MAX_LOCATIONS} locations allowed`);
  }

  const slug = await generateUniqueSlug(payload.name);

  const { data, error } = await supabaseAdmin
    .from("businesses")
    .insert({
      name: payload.name,
      slug,
      business_type: payload.business_type ?? "dental",
      clerk_user_id: payload.clerk_user_id,
      organization_id: orgId,
      is_primary_location: false,
      plan: "multi",
      plan_status: "active",
      ai_name: "Claire",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLocation(
  orgId: string,
  businessId: string
): Promise<void> {
  // Verify it belongs to this org and is not primary
  const { data: loc, error } = await supabaseAdmin
    .from("businesses")
    .select("id, is_primary_location, organization_id")
    .eq("id", businessId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (error) throw error;
  if (!loc) throw new Error("Location not found in this organization");
  if (loc.is_primary_location) throw new Error("Cannot delete the primary location");

  const { error: delError } = await supabaseAdmin
    .from("businesses")
    .delete()
    .eq("id", businessId);

  if (delError) throw delError;
}

// Called when a user upgrades to Multi-Practice.
// Creates the organizations row and backfills the existing business as primary location.
export async function promoteToOrganization(
  clerkUserId: string,
  business: { id: string; name: string; stripe_customer_id?: string | null; stripe_subscription_id?: string | null; billing_cycle?: string }
): Promise<Organization> {
  // Idempotent: return existing org if already promoted
  const existing = await getOrganization(clerkUserId);
  if (existing) return existing;

  const { data: org, error: orgError } = await supabaseAdmin
    .from("organizations")
    .insert({
      owner_clerk_user_id: clerkUserId,
      name: business.name,
      stripe_customer_id: business.stripe_customer_id ?? null,
      stripe_subscription_id: business.stripe_subscription_id ?? null,
      plan: "multi",
      plan_status: "active",
      billing_cycle: business.billing_cycle ?? "monthly",
      total_minutes_limit: 3750,
    })
    .select("*")
    .single();

  if (orgError) throw orgError;

  // Backfill the primary location
  const { error: bizError } = await supabaseAdmin
    .from("businesses")
    .update({ organization_id: org.id, is_primary_location: true })
    .eq("id", business.id);

  if (bizError) throw bizError;

  return org;
}

// Returns the display name for a location (falls back to business.name)
export function locationDisplayName(business: Business): string {
  return business.location_display_name ?? business.name;
}

// Verifies that a given businessId belongs to the caller's org.
// Returns the target business if owned, null if not multi-plan or org not found, throws on unauthorized.
export async function verifyLocationOwnership(
  clerkUserId: string,
  targetBusinessId: string
): Promise<{ owned: boolean; orgId: string | null }> {
  const [callerBiz, org] = await Promise.all([
    supabaseAdmin
      .from("businesses")
      .select("plan")
      .eq("clerk_user_id", clerkUserId)
      .single()
      .then((r) => r.data),
    getOrganization(clerkUserId),
  ]);

  if (callerBiz?.plan !== "multi" || !org) return { owned: false, orgId: null };

  const locations = await getOrgLocations(org.id);
  const owned = locations.some((l) => l.id === targetBusinessId);
  return { owned, orgId: org.id };
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = base;
  let attempt = 0;

  while (true) {
    const { data } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;

    attempt++;
    slug = `${base}-${attempt}`;
  }
}
