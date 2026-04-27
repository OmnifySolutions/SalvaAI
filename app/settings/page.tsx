import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import SettingsForm from "@/components/SettingsForm";
import Logo from "@/components/Logo";
import LocationSwitcher from "@/components/LocationSwitcher";
import { getOrganization, getOrgLocations } from "@/lib/organizations";
import type { Business } from "@/lib/supabase";

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const params = await searchParams;

  const { data: primaryBusiness } = await supabaseAdmin
    .from("businesses")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (!primaryBusiness) redirect("/onboarding");

  // Multi-practice: load org + locations
  let locations: Business[] = [];
  let activeBusiness = primaryBusiness as Business;

  if (primaryBusiness.plan === "multi") {
    const org = await getOrganization(userId);
    if (org) {
      locations = await getOrgLocations(org.id);

      // Load the specific location if ?location= param is set
      const locationParam = params.location;
      if (locationParam) {
        const found = locations.find((l) => l.id === locationParam);
        if (found) activeBusiness = found;
      }
    }
  }

  const isMulti = primaryBusiness.plan === "multi" && locations.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="transition-opacity hover:opacity-80">
          <Logo width={110} height={27} />
        </Link>
        <Link
          href="/dashboard"
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-gray-800 transition-colors"
        >
          Dashboard
        </Link>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mb-6">Update your AI receptionist configuration.</p>

        {isMulti && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700">Editing:</span>
            <LocationSwitcher
              locations={locations.map((l) => ({ id: l.id, name: l.name, location_display_name: l.location_display_name }))}
              currentLocationId={activeBusiness.id}
              basePath="/settings"
            />
          </div>
        )}

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <SettingsForm business={activeBusiness as any} forLocationId={isMulti ? activeBusiness.id : undefined} />
      </div>
    </div>
  );
}
