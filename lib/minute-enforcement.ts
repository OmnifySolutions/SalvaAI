import { supabaseAdmin } from "./supabase";

export type PlanMinuteLimits = {
  basic: 0; // chat-only
  pro: 1000;
  growth: 2000;
  multi: 5000; // 1,000 × 5 locations
};

export const PLAN_MINUTE_LIMITS: PlanMinuteLimits = {
  basic: 0,
  pro: 1000,
  growth: 2000,
  multi: 5000,
};

/**
 * Check if a business has minutes available for voice calls
 */
export async function hasMinutesAvailable(
  businessId: string
): Promise<{ available: boolean; minutesUsed: number; minutesLimit: number }> {
  try {
    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("plan, minutes_used_this_period, minutes_limit_monthly")
      .eq("id", businessId)
      .single();

    if (!business) {
      return { available: false, minutesUsed: 0, minutesLimit: 0 };
    }

    // Chat-only plans have no voice minutes
    if (business.plan === "basic") {
      return { available: false, minutesUsed: 0, minutesLimit: 0 };
    }

    const minutesUsed = business.minutes_used_this_period || 0;
    const minutesLimit = business.minutes_limit_monthly || PLAN_MINUTE_LIMITS[business.plan as keyof PlanMinuteLimits];

    const available = minutesUsed < minutesLimit;

    return { available, minutesUsed, minutesLimit };
  } catch (error) {
    console.error("Error checking minute availability:", error);
    return { available: false, minutesUsed: 0, minutesLimit: 0 };
  }
}

/**
 * Record voice call duration and update minute usage
 */
export async function recordCallDuration(
  businessId: string,
  durationSeconds: number
): Promise<void> {
  try {
    const durationMinutes = Math.ceil(durationSeconds / 60);

    await supabaseAdmin.rpc("increment_minutes_used", {
      business_id: businessId,
      minutes_to_add: durationMinutes,
    });
  } catch (error) {
    // If RPC doesn't exist, fall back to direct update
    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("minutes_used_this_period")
      .eq("id", businessId)
      .single();

    const currentMinutes = (business?.minutes_used_this_period || 0) + Math.ceil(durationSeconds / 60);

    await supabaseAdmin
      .from("businesses")
      .update({ minutes_used_this_period: currentMinutes })
      .eq("id", businessId);
  }
}

/**
 * Reset monthly minute usage (typically called on billing period reset)
 */
export async function resetMonthlyMinutes(businessId: string): Promise<void> {
  try {
    await supabaseAdmin
      .from("businesses")
      .update({ minutes_used_this_period: 0 })
      .eq("id", businessId);
  } catch (error) {
    console.error("Error resetting monthly minutes:", error);
  }
}
