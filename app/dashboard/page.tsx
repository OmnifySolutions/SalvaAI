// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import DashboardCharts from "@/components/DashboardCharts";
import {
  PhoneCall,
  MessageSquare,
  Settings,
  Moon,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import {
  getAppointmentStats,
  getCallVolumeSeries,
  getAfterHoursCount,
  getUrgencyBreakdown,
  getPeakContactHours,
  getEmergencyFlagCount,
  getOrgAppointmentStats,
  getOrgCallVolumeSeries,
  getOrgAfterHoursCount,
  getOrgEmergencyFlagCount,
  getOrgUrgencyBreakdown,
} from "@/lib/dashboard";
import DashboardStats from "@/components/DashboardStats";
import InboxSection from "@/components/InboxSection";
import AggregatedInboxSection from "@/components/AggregatedInboxSection";
import Logo from "@/components/Logo";
import SetupChecklist from "@/components/SetupChecklist";
import DashboardOnboardingFlag from "@/components/DashboardOnboardingFlag";
import PlanBadge from "@/components/PlanBadge";
import LocationSwitcher from "@/components/LocationSwitcher";
import LocationCard from "@/components/LocationCard";
import NotificationBell from "@/components/NotificationBell";
import MinuteUsageCard from "@/components/MinuteUsageCard";
import { Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import { getOrganization, getOrgLocations } from "@/lib/organizations";
import type { Business } from "@/lib/supabase";
import { ArrowRight } from "lucide-react";

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const { userId } = await auth();
  const params = await searchParams;

  // Get this user's primary business
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (!business) redirect("/onboarding");

  // Get billing period end from database
  const billingPeriodEnd = business.current_period_end ? new Date(business.current_period_end).toISOString() : null;

  // Multi-practice: load org + all locations
  let org = null;
  let locations: Business[] = [];
  if (business.plan === "multi") {
    org = await getOrganization(userId!);
    if (org) locations = await getOrgLocations(org.id);
  }

  // Determine which location is selected
  const locationParam = params.location;
  const isMulti = business.plan === "multi" && org && locations.length > 0;
  const showAll = isMulti && (!locationParam || locationParam === "all");

  // Determine which businessId to show stats for (per-location view)
  let activeBusiness = business;
  if (isMulti && locationParam && locationParam !== "all") {
    const found = locations.find((l) => l.id === locationParam);
    if (found) activeBusiness = found as typeof business;
  }

  const locationIds = locations.map((l) => l.id);

  // Fetch dashboard data for the active view
  const [
    { data: feedConversations },
    { data: allConversations },
    appointments,
    callVolume,
    afterHours,
    urgency,
    peakHours,
    emergencyFlags,
  ] = await Promise.all([
    supabaseAdmin
      .from("conversations")
      .select("id, channel, status, created_at, ended_at")
      .eq("business_id", showAll ? business.id : activeBusiness.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("conversations")
      .select("id, channel, created_at")
      .eq("business_id", showAll ? business.id : activeBusiness.id)
      .order("created_at", { ascending: false }),
    showAll ? getOrgAppointmentStats(locationIds) : getAppointmentStats(activeBusiness.id),
    showAll ? getOrgCallVolumeSeries(locationIds) : getCallVolumeSeries(activeBusiness.id),
    showAll ? getOrgAfterHoursCount(locationIds) : getAfterHoursCount(activeBusiness.id),
    showAll ? getOrgUrgencyBreakdown(locationIds) : getUrgencyBreakdown(activeBusiness.id),
    getPeakContactHours(activeBusiness.id),
    showAll ? getOrgEmergencyFlagCount(locationIds) : getEmergencyFlagCount(activeBusiness.id),
  ]);

  const appointmentTrend =
    appointments.lastMonthDelta === 0
      ? "This month"
      : `${appointments.lastMonthDelta > 0 ? "+" : ""}${appointments.lastMonthDelta} vs last month`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={null}><DashboardOnboardingFlag /></Suspense>
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="transition-opacity hover:opacity-80">
            <Logo width={110} height={27} />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <span className="text-gray-900 border-b-2 border-gray-900 pb-1">Overview</span>
            <Link href="/settings" className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5"><Settings size={16}/> Settings</Link>
            {isMulti && (
              <Link href="/dashboard/locations" className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5">
                <MapPin size={16}/> Locations
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {isMulti && (
            <LocationSwitcher
              locations={locations.map((l) => ({ id: l.id, name: l.name, location_display_name: l.location_display_name }))}
              currentLocationId={locationParam ?? "all"}
            />
          )}
          {isMulti && org && (
            <NotificationBell orgId={org.id} locationIds={locationIds} />
          )}
          <PlanBadge plan={business.plan ?? "free"} planStatus={business.plan_status} />
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
            {isMulti && !showAll ? (activeBusiness.location_display_name ?? activeBusiness.name) : business.name}
          </span>
          <SignOutButton />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Setup checklist — only in single or per-location view */}
        {!showAll && <SetupChecklist business={activeBusiness} />}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Intelligence Center</h1>
            <p className="text-sm text-gray-500">
              {showAll
                ? `${locations.length} locations active — aggregated view`
                : "Your AI agent is answering calls and chats right now."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Agent Active
            </div>
            {(activeBusiness.plan === "pro" || activeBusiness.plan === "multi") && !showAll && (
              <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-700 shadow-sm">
                <span className="text-gray-400 mr-2">Forwarding to:</span>
                <span className="font-mono">{activeBusiness.twilio_sid || "Pending..."}</span>
              </div>
            )}
          </div>
        </div>

        {/* Inbox — aggregated for "all", single-business for per-location */}
        {showAll && org ? (
          <AggregatedInboxSection
            orgId={org.id}
            locationIds={locationIds}
            opendentalConnected={!!activeBusiness.opendental_api_key}
          />
        ) : (
          <InboxSection opendentalConnected={!!activeBusiness.opendental_api_key} />
        )}

        {/* Voice Minutes Usage — page-wide, sleek card */}
        {activeBusiness.plan !== "basic" && (
          <div className="mb-8">
            <MinuteUsageCard businessId={activeBusiness.id} billingPeriodEnd={billingPeriodEnd} />
          </div>
        )}

        {/* Stats Row */}
        <DashboardStats
          allConversations={allConversations ?? []}
          totalInteractions={activeBusiness.interaction_count ?? 0}
          appointmentsTotal={appointments.total}
          appointmentTrend={appointmentTrend}
        />

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatWidget
            icon={Moon}
            label="After-Hours Handled"
            value={afterHours.count}
            trend={`${afterHours.pct}% of total volume`}
            color="blue"
          />
          <StatWidget
            icon={AlertTriangle}
            label="Emergency Flags"
            value={emergencyFlags.count}
            trend={showAll ? `All locations · Last 30 days` : "Last 30 days"}
            color={emergencyFlags.count > 0 ? "red" : "gray"}
          />
        </div>

        {/* Charts */}
        <DashboardCharts
          callVolumeData={callVolume}
          urgencyData={urgency}
          peakHoursData={peakHours}
        />

        {/* Location Cards (aggregated view only) */}
        {showAll && locations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-900 mb-4 tracking-tight">Locations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <LocationCard
                  key={loc.id}
                  businessId={loc.id}
                  name={loc.name}
                  displayName={loc.location_display_name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Recent Activity Stream</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {!feedConversations || feedConversations.length === 0 ? (
              <li className="px-6 py-10 text-center text-gray-400 text-sm">
                No conversations yet. Your feed will populate automatically.
              </li>
            ) : (
              feedConversations.map((conv) => (
                <li key={conv.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      conv.channel === "voice" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {conv.channel === "voice" ? <PhoneCall size={18} /> : <MessageSquare size={18} />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize flex items-center gap-2">
                        {conv.channel} Inquiry
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                          conv.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>{conv.status}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(conv.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">View →</div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Bottom CTA Cards — Clean Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeBusiness.plan === "free" && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-white shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-600 rounded-full opacity-30 blur-3xl group-hover:opacity-40 transition-opacity"></div>
              <div className="relative flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                    <PhoneCall size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl mb-2 tracking-tight">Unlock Voice AI</h3>
                    <p className="text-blue-100/70 text-sm leading-relaxed">
                      Start answering calls 24/7. Upgrade to Pro to enable your Voice Agent and OpenDental sync.
                    </p>
                  </div>
                </div>
                <Link href="/pricing" className="flex-shrink-0 ml-4 text-sm bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap">
                  View Plans →
                </Link>
              </div>
            </div>
          )}

          {activeBusiness.plan !== "free" && activeBusiness.plan !== "multi" && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
              <div className="mb-4 flex-1">
                <h3 className="text-lg font-black text-orange-900 tracking-tight mb-1">Ready to scale?</h3>
                <p className="text-orange-700/80 text-sm">
                  {activeBusiness.plan === "basic" && "Unlock voice answering with Pro. Start at $249/mo."}
                  {activeBusiness.plan === "pro" && "Handle 2,700+ more minutes with Growth. Start at $449/mo."}
                  {activeBusiness.plan === "growth" && "Manage 5 locations with Multi-Practice. Start at $849/mo."}
                </p>
              </div>
              <Link href="/pricing" className="w-full text-sm bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg font-semibold transition-colors flex justify-center items-center gap-2">
                Explore Plans <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {activeBusiness.plan === "pro" && !activeBusiness.opendental_api_key && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-50/30 rounded-2xl border border-blue-100 p-6 relative overflow-hidden group flex flex-col hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              {/* OpenDental branding background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-3xl -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
              <div className="absolute -bottom-6 -left-6 opacity-5 text-6xl font-black text-blue-600">◆</div>

              <div className="relative flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-black text-blue-900 tracking-tight">Connect OpenDental</h3>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-100/60 px-2.5 py-1 rounded-full">OpenDental</span>
                </div>
                <p className="text-blue-700/80 text-xs mb-4 flex-1">
                  Your AI agent cannot book appointments yet. Connect your PMS to enable live calendar sync.
                </p>
                <Link href="/settings#practice-management" className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors flex justify-center items-center gap-2">
                  Connect Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type StatWidgetProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  trend: string;
  color: "blue" | "green" | "yellow" | "purple" | "red" | "gray";
};

const colorMap: Record<StatWidgetProps["color"], string> = {
  blue: "text-blue-600 bg-blue-50",
  green: "text-green-600 bg-green-50",
  yellow: "text-orange-600 bg-orange-50",
  purple: "text-purple-600 bg-purple-50",
  red: "text-red-600 bg-red-50",
  gray: "text-gray-600 bg-gray-100",
};

function StatWidget({ icon: Icon, label, value, trend, color }: StatWidgetProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
      <div className="text-sm font-medium text-gray-500 mt-1">{label}</div>
      <div className="mt-4 text-xs font-semibold text-gray-400 border-t border-gray-50 pt-3">
        {trend}
      </div>
    </div>
  );
}
