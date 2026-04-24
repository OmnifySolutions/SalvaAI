"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const BUSINESS_TYPES = [
  { value: "dental", label: "General Dentistry" },
  { value: "orthodontics", label: "Orthodontics" },
  { value: "oral_surgery", label: "Oral Surgery" },
  { value: "pediatric", label: "Pediatric Dentistry" },
];

type Props = {
  onClose: () => void;
  locationCount: number;
  maxLocations: number;
};

export default function AddLocationModal({ onClose, locationCount, maxLocations }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("dental");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Location name is required"); return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), business_type: businessType }),
      });
      const json = await res.json();

      if (!res.ok) { setError(json.error ?? "Failed to create location"); return; }

      router.refresh();
      onClose();
    } catch {
      setError("Failed to create location. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">Add Location</h2>
            <p className="text-sm text-gray-400 mt-0.5">{locationCount} / {maxLocations} locations used</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Location Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Downtown Office, Uptown Clinic"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Specialty</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <p className="text-xs text-gray-400 leading-relaxed">
            After adding, you can configure this location's AI, hours, and settings from the Settings page.
          </p>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
