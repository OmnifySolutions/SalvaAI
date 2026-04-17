// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import UpgradeButton from "@/components/UpgradeButton";
import DashboardCharts from "@/components/DashboardCharts";
import {
  MessageSquare,
  PhoneCall,
  CalendarCheck,
  TrendingUp,
  Users,
  Settings,
  Moon,
  AlertTriangle,
} from "lucide-react";
import {
  getAppointmentStats,
  getUniqueVisitors,
  getCallVolumeSeries,
  getRevenueSeries,
  getActiveCampaigns,
  getAfterHoursCount,
  getUrgencyBreakdown,
  getPeakContactHours,
  getEmergencyFlagCount,
} from "@/lib/dashboard";
import type { LucideIcon } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Get this user's business
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (!business) redirect("/onboarding");

  // Get recent conversations + all dashboard metrics in parallel.
  const avgApptValue = (business.avg_appointment_value as number | null) ?? 150;
  const [
    { data: conversations },
    appointments,
    visitors,
    callVolume,
    revenue,
    campaigns,
    afterHours,
    urgency,
    peakHours,
    emergencyFlags,
  ] = await Promise.all([
    supabaseAdmin
      .from("conversations")
      .select("id, channel, status, created_at, ended_at")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(5),
    getAppointmentStats(business.id),
    getUniqueVisitors(business.id),
    getCallVolumeSeries(business.id),
    getRevenueSeries(business.id, avgApptValue),
    getActiveCampaigns(business.id),
    getAfterHoursCount(business.id),
    getUrgencyBreakdown(business.id),
    getPeakContactHours(business.id),
    getEmergencyFlagCount(business.id),
  ]);

  const appointmentTrend =
    appointments.lastMonthDelta === 0
      ? "This month"
      : `${appointments.lastMonthDelta > 0 ? "+" : ""}${appointments.lastMonthDelta} vs last month`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-bold text-gray-900 text-lg">Salva AI</Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <span className="text-gray-900 border-b-2 border-gray-900 pb-1">Overview</span>
            <a href="#campaigns-section" className="text-gray-500 hover:text-gray-900">Campaigns</a>
            <Link href="/settings" className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5"><Settings size={16}/> Settings</Link>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">{business.name}</span>
          <SignOutButton />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Realtime Agent Status Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Intelligence Center</h1>
            <p className="text-sm text-gray-500">Welcome back. Your AI agent is answering calls and chats right now.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Agent Active
            </div>
            {(business.plan === "pro" || business.plan === "multi") && (
              <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-700 shadow-sm">
                <span className="text-gray-400 mr-2">Forwarding to:</span>
                <span className="font-mono">{business.twilio_sid || "Pending..."}</span>
              </div>
            )}
          </div>
        </div>

        {/* Premium Stat Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <StatWidget icon={PhoneCall} label="Total Interactions" value={business.interaction_count} trend="All time" color="blue" />
          <StatWidget icon={CalendarCheck} label="Appointments Booked" value={appointments.total} trend={appointmentTrend} color="green" />
          <StatWidget icon={MessageSquare} label="Active Chats" value={conversations?.filter(c => c.status === "active").length || 0} trend="Live" color="yellow" />
          <StatWidget icon={Users} label="Total Patients Engaged" value={visitors.total} trend="All time" color="purple" />
        </div>

        {/* Secondary Stat Row — after-hours + emergency */}
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
            trend="Last 30 days"
            color={emergencyFlags.count > 0 ? "red" : "gray"}
          />
        </div>

        {/* Recharts Inject */}
        <DashboardCharts
          callVolumeData={callVolume}
          revenueData={revenue.series}
          revenueTotal={revenue.total}
          urgencyData={urgency}
          peakHoursData={peakHours}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed / Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Live Call/Chat Feed */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Activity Stream</h2>
              </div>
              <ul className="divide-y divide-gray-50">
                {!conversations || conversations.length === 0 ? (
                  <li className="px-6 py-10 text-center text-gray-400 text-sm">
                    No conversations yet. Your feed will populate automatically.
                  </li>
                ) : (
                  conversations.map((conv) => (
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
                              conv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
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
            
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Active Campaigns */}
            <div id="campaigns-section" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">Active Campaigns</h2>
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
              </div>
              <ul className="space-y-4">
                {campaigns.length === 0 ? (
                  <li className="text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl p-4 text-center">
                    No active campaigns. Create one to re-engage past patients.
                  </li>
                ) : (
                  campaigns.map((c) => {
                    const openPct =
                      c.recipients_count > 0
                        ? Math.round((c.open_count / c.recipients_count) * 100)
                        : 0;
                    return (
                      <li key={c.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm text-gray-900">{c.name}</span>
                          <span className="text-xs text-blue-600 font-bold">{openPct}% Open</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${openPct}%` }}></div>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          {c.appointments_booked} appointments booked via AI
                        </p>
                      </li>
                    );
                  })
                )}
              </ul>
              <Link
                href="/settings#campaigns"
                className="w-full mt-4 py-2 bg-gray-50 text-gray-500 text-sm font-medium rounded-xl block text-center hover:bg-gray-100 transition-colors"
              >
                + New Campaign
              </Link>
            </div>

            {/* Quick Actions / Upgrades */}
            {business.plan === "free" && (
              <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-600 rounded-full opacity-30 blur-3xl group-hover:opacity-40 transition-opacity"></div>
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-5 border border-blue-500/30">
                  <PhoneCall size={24} />
                </div>
                <h3 className="font-black text-2xl mb-3 tracking-tight">Unlock Voice AI</h3>
                <p className="text-blue-100/70 text-sm mb-6 leading-relaxed">
                  Start answering calls 24/7. Upgrade to Pro to enable your Voice Agent and OpenDental sync.
                </p>
                <div className="flex flex-col gap-3">
                  <UpgradeButton plan="pro" className="w-full text-sm bg-white hover:bg-gray-100 text-gray-900 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex justify-center items-center gap-2">
                    Buy Pro — $219/mo
                  </UpgradeButton>
                </div>
              </div>
            )}
            
            {business.plan === "pro" && !business.opendental_api_key && (
               <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
                 <h3 className="font-bold text-blue-900 text-sm mb-2">Connect OpenDental</h3>
                 <p className="text-blue-700/80 text-xs mb-4">
                   Your AI agent cannot book appointments yet. Connect your PMS to enable live calendar sync.
                 </p>
                 <Link href="/settings#practice-management" className="text-xs font-bold bg-white text-blue-600 px-4 py-2 rounded-lg shadow-sm block text-center">
                   Connect Now
                 </Link>
               </div>
            )}
          </div>
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
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
      <div className="text-sm font-medium text-gray-500 mt-1">{label}</div>
      <div className="mt-4 text-xs font-semibold text-gray-400 border-t border-gray-50 pt-3">
        {trend}
      </div>
    </div>
  );
}
