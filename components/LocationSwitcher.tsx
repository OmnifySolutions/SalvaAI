"use client";

import { useRouter } from "next/navigation";

type Location = { id: string; name: string; location_display_name?: string | null };

type Props = {
  locations: Location[];
  currentLocationId: string;
  basePath?: string;
};

export default function LocationSwitcher({ locations, currentLocationId, basePath = "/dashboard" }: Props) {
  const router = useRouter();

  const displayName = (loc: Location) => loc.location_display_name ?? loc.name;

  return (
    <select
      value={currentLocationId}
      onChange={(e) => router.push(`${basePath}?location=${e.target.value}`)}
      className="text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200 rounded-full px-3 py-1.5 cursor-pointer hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
    >
      <option value="all">All Locations</option>
      {locations.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {displayName(loc)}
        </option>
      ))}
    </select>
  );
}
