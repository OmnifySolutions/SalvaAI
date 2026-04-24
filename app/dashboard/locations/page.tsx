"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Plus, Settings, Trash2, ArrowLeft } from "lucide-react";
import AddLocationModal from "@/components/AddLocationModal";

type Location = {
  id: string;
  name: string;
  location_display_name: string | null;
  is_primary_location: boolean;
  business_type: string;
};

const MAX_LOCATIONS = 5;

export default function LocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchLocations() {
    try {
      const res = await fetch("/api/locations");
      if (res.status === 403) { router.push("/dashboard"); return; }
      const json = await res.json();
      setLocations(json.locations ?? []);
    } catch {
      setError("Failed to load locations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchLocations(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will permanently remove all conversations for this location.`)) return;

    setDeleting(id);
    setError(null);
    try {
      const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to delete location"); return; }
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setError("Failed to delete location");
    } finally {
      setDeleting(null);
    }
  }

  const displayName = (loc: Location) => loc.location_display_name ?? loc.name;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Manage Locations</h1>
              <p className="text-sm text-gray-500 mt-1">Configure and manage your practice locations.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={locations.length >= MAX_LOCATIONS}
              className="flex items-center gap-2 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Add Location
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">
              {loading ? "Loading..." : `${locations.length} / ${MAX_LOCATIONS} locations`}
            </span>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading locations...</div>
          ) : locations.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">No locations found.</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {locations.map((loc) => (
                <li key={loc.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        {displayName(loc)}
                        {loc.is_primary_location && (
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase tracking-wide">Primary</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">
                        {loc.business_type?.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/settings?location=${loc.id}`}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Settings size={13} /> Configure
                    </Link>
                    {!loc.is_primary_location && (
                      <button
                        onClick={() => handleDelete(loc.id, displayName(loc))}
                        disabled={deleting === loc.id}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        {deleting === loc.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {locations.length >= MAX_LOCATIONS && (
          <p className="text-xs text-gray-400 text-center mt-4">
            You have reached the maximum of {MAX_LOCATIONS} locations for the Multi-Practice plan.
          </p>
        )}
      </div>

      {showModal && (
        <AddLocationModal
          onClose={() => { setShowModal(false); fetchLocations(); }}
          locationCount={locations.length}
          maxLocations={MAX_LOCATIONS}
        />
      )}
    </div>
  );
}
