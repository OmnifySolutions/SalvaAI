"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HoursPicker, { type WeeklyHours, DEFAULT_HOURS } from "@/components/HoursPicker";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<{
    businessName: string;
    businessType: string;
    hours: WeeklyHours;
    services: string;
  }>({
    businessName: "",
    businessType: "dental",
    hours: DEFAULT_HOURS,
    services: "General dentistry, cleanings, fillings, crowns, teeth whitening",
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Set up your AI receptionist</h1>
        <p className="text-gray-500 text-sm mb-8">Takes 2 minutes. You can update everything later.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Practice name <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="Sunshine Family Dentistry"
              value={form.businessName}
              onChange={(e) => set("businessName", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business type</label>
            <select
              value={form.businessType}
              onChange={(e) => set("businessType", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="dental">Dental Office</option>
              <option value="orthodontics">Orthodontics</option>
              <option value="oral_surgery">Oral Surgery</option>
              <option value="pediatric_dental">Pediatric Dentistry</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Office hours</label>
            <div className="border border-gray-300 rounded-lg px-3 py-1">
              <HoursPicker
                value={form.hours}
                onChange={(h) => setForm((f) => ({ ...f, hours: h }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Services offered</label>
            <textarea
              rows={3}
              placeholder="Cleanings, fillings, crowns, whitening..."
              value={form.services}
              onChange={(e) => set("services", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Setting up..." : "Create my AI receptionist →"}
          </button>
        </form>
      </div>
    </div>
  );
}
