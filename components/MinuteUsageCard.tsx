import { supabaseAdmin } from "@/lib/supabase";
import { PLAN_MINUTE_LIMITS } from "@/lib/minute-enforcement";
import { Phone } from "lucide-react";

interface MinuteUsageCardProps {
  businessId: string;
  billingPeriodEnd?: string | null;
}

const AVG_CALL_DURATION_MINUTES = 3;

export default async function MinuteUsageCard({ businessId, billingPeriodEnd }: MinuteUsageCardProps) {
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("plan, minutes_used_this_period, minutes_limit_monthly")
    .eq("id", businessId)
    .single();

  if (!business || business.plan === "basic") {
    return null;
  }

  const minutesUsed = business.minutes_used_this_period || 0;
  const minutesLimit = business.minutes_limit_monthly || PLAN_MINUTE_LIMITS[business.plan as keyof typeof PLAN_MINUTE_LIMITS] || 750;
  const percentageUsed = Math.round((minutesUsed / minutesLimit) * 100);
  const minutesRemaining = Math.max(0, minutesLimit - minutesUsed);

  const estimatedCallsTotal = Math.floor(minutesLimit / AVG_CALL_DURATION_MINUTES);
  const estimatedCallsUsed = Math.floor(minutesUsed / AVG_CALL_DURATION_MINUTES);
  const estimatedCallsRemaining = Math.max(0, estimatedCallsTotal - estimatedCallsUsed);

  let statusColor = "text-green-600 bg-green-50";
  let barColor = "bg-green-500";
  if (percentageUsed >= 80) {
    statusColor = "text-red-600 bg-red-50";
    barColor = "bg-red-500";
  } else if (percentageUsed >= 50) {
    statusColor = "text-amber-600 bg-amber-50";
    barColor = "bg-amber-500";
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
            <Phone className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Monthly Voice Minutes</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {billingPeriodEnd ? (
                <>
                  {(() => {
                    const endDate = new Date(billingPeriodEnd);
                    const now = new Date();
                    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const dateStr = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    return daysLeft > 0
                      ? `Resets ${dateStr} (${daysLeft} day${daysLeft === 1 ? "" : "s"} left)`
                      : `Ended ${dateStr}`;
                  })()}
                </>
              ) : (
                "Resets monthly"
              )}
            </p>
          </div>
        </div>
        <div className={`text-right px-3.5 py-2.5 rounded-lg font-bold text-lg ${statusColor}`}>
          {percentageUsed}%
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="text-xs text-blue-600 font-semibold mb-1">Calls Remaining</div>
          <div className="text-2xl font-black text-blue-600">~{estimatedCallsRemaining}</div>
          <div className="text-[10px] text-blue-600/60 mt-1">at {AVG_CALL_DURATION_MINUTES} min avg</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-600 font-semibold mb-1">Minutes Remaining</div>
          <div className="text-2xl font-black text-gray-700">{minutesRemaining}</div>
          <div className="text-[10px] text-gray-500 mt-1">of {minutesLimit} total</div>
        </div>
      </div>

      {/* Warning Alert */}
      {percentageUsed >= 80 && (
        <div className={`text-xs rounded-lg p-3 mb-4 ${
          percentageUsed >= 100
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}>
          {percentageUsed >= 100
            ? "Your account has reached its monthly limit. Purchase overages at $0.35/min or upgrade."
            : "Running low on voice minutes. Consider purchasing overages at $0.35/min or upgrade your plan."}
        </div>
      )}

      {/* Progress Bar - Full Width */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600">Progress</span>
          <span className="text-xs text-gray-500">{minutesUsed} / {minutesLimit} minutes</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
