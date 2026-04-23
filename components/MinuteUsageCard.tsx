import { supabaseAdmin } from "@/lib/supabase";
import { PLAN_MINUTE_LIMITS } from "@/lib/minute-enforcement";

interface MinuteUsageCardProps {
  businessId: string;
}

export default async function MinuteUsageCard({ businessId }: MinuteUsageCardProps) {
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

  let statusColor = "text-green-600";
  let barColor = "bg-green-500";
  if (percentageUsed >= 80) {
    statusColor = "text-red-600";
    barColor = "bg-red-500";
  } else if (percentageUsed >= 50) {
    statusColor = "text-yellow-600";
    barColor = "bg-yellow-500";
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Monthly Voice Minutes</h3>
          <p className="text-sm text-gray-500 mt-1">
            {minutesUsed} / {minutesLimit} minutes used
          </p>
        </div>
        <div className={`text-right ${statusColor}`}>
          <div className="text-2xl font-bold">{percentageUsed}%</div>
          <div className="text-xs font-medium">{minutesRemaining} remaining</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
        />
      </div>

      {percentageUsed >= 80 && (
        <p className="text-sm text-red-600 mt-4">
          {percentageUsed >= 100
            ? "Your account has reached its monthly minute limit. Upgrade your plan to continue."
            : "You're running low on voice minutes. Consider upgrading your plan."}
        </p>
      )}
    </div>
  );
}
