import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { MapPin, PhoneCall, AlertTriangle, Calendar } from "lucide-react";

type Props = {
  businessId: string;
  name: string;
  displayName?: string | null;
};

export default async function LocationCard({ businessId, name, displayName }: Props) {
  const label = displayName ?? name;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: totalConvs }, { count: emergencies }, { count: pendingBookings }] =
    await Promise.all([
      supabaseAdmin
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .gte("created_at", sevenDaysAgo),
      supabaseAdmin
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("urgency", "emergency")
        .gte("created_at", thirtyDaysAgo),
      supabaseAdmin
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("appointment_requested", true)
        .neq("appointment_booked_status", "confirmed")
        .is("resolved_at", null),
    ]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <MapPin size={16} />
          </div>
          <span className="font-bold text-gray-900 text-sm">{label}</span>
        </div>
        <span className="flex h-2 w-2 relative mt-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xl font-black text-gray-900">{totalConvs ?? 0}</div>
          <div className="text-[10px] text-gray-400 flex items-center justify-center gap-0.5 mt-0.5">
            <PhoneCall size={9} /> 7d
          </div>
        </div>
        <div>
          <div className={`text-xl font-black ${(emergencies ?? 0) > 0 ? "text-red-600" : "text-gray-900"}`}>
            {emergencies ?? 0}
          </div>
          <div className="text-[10px] text-gray-400 flex items-center justify-center gap-0.5 mt-0.5">
            <AlertTriangle size={9} /> Emerg
          </div>
        </div>
        <div>
          <div className={`text-xl font-black ${(pendingBookings ?? 0) > 0 ? "text-blue-600" : "text-gray-900"}`}>
            {pendingBookings ?? 0}
          </div>
          <div className="text-[10px] text-gray-400 flex items-center justify-center gap-0.5 mt-0.5">
            <Calendar size={9} /> Pending
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1 border-t border-gray-50">
        <Link
          href={`/dashboard?location=${businessId}`}
          className="flex-1 text-center text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg py-1.5 transition-colors"
        >
          View
        </Link>
        <Link
          href={`/settings?location=${businessId}`}
          className="flex-1 text-center text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-1.5 transition-colors"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}
