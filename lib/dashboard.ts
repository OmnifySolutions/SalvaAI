// Server-side dashboard metric helpers. Every function degrades gracefully:
// if the migration hasn't landed or the table is empty, returns zeroed data
// so the dashboard still renders instead of crashing.

import { supabaseAdmin } from "@/lib/supabase";

export type Campaign = {
  id: string;
  name: string;
  type: string;
  status: string;
  recipients_count: number;
  open_count: number;
  click_count: number;
  appointments_booked: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const nDaysAgo = (n: number) => new Date(Date.now() - n * DAY_MS).toISOString();
const startOfMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
const startOfPrevMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString();

async function safeCount(
  filter: (q: ReturnType<typeof supabaseAdmin.from>) => PromiseLike<{ count: number | null; error: unknown }>
): Promise<number> {
  try {
    const { count, error } = await filter(supabaseAdmin.from("conversations"));
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getAppointmentStats(businessId: string): Promise<{
  total: number;
  thisMonth: number;
  lastMonthDelta: number;
}> {
  const [total, thisMonth, lastMonth] = await Promise.all([
    safeCount((q) =>
      q.select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("appointment_requested", true)
    ),
    safeCount((q) =>
      q.select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("appointment_requested", true)
        .gte("created_at", startOfMonth())
    ),
    safeCount((q) =>
      q.select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("appointment_requested", true)
        .gte("created_at", startOfPrevMonth())
        .lt("created_at", startOfMonth())
    ),
  ]);
  return { total, thisMonth, lastMonthDelta: thisMonth - lastMonth };
}

export async function getUniqueVisitors(businessId: string): Promise<{ total: number }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("conversations")
      .select("visitor_phone, visitor_email")
      .eq("business_id", businessId);
    if (error || !data) return { total: 0 };
    const uniq = new Set<string>();
    for (const row of data as Array<{ visitor_phone: string | null; visitor_email: string | null }>) {
      const id = row.visitor_phone ?? row.visitor_email;
      if (id) uniq.add(id);
    }
    return { total: uniq.size };
  } catch {
    return { total: 0 };
  }
}

export async function getCallVolumeSeries(
  businessId: string
): Promise<Array<{ name: string; calls: number; handled: number }>> {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * DAY_MS);
    return { name: days[d.getDay()], calls: 0, handled: 0, date: d.toDateString() };
  });
  try {
    const { data, error } = await supabaseAdmin
      .from("conversations")
      .select("created_at, channel")
      .eq("business_id", businessId)
      .gte("created_at", nDaysAgo(7));
    if (error || !data) return buckets.map(({ name, calls, handled }) => ({ name, calls, handled }));
    for (const row of data as Array<{ created_at: string; channel: string }>) {
      const key = new Date(row.created_at).toDateString();
      const bucket = buckets.find((b) => b.date === key);
      if (!bucket) continue;
      bucket.calls++;
      if (row.channel === "voice") bucket.handled++;
    }
  } catch {
    /* fall through to zeroed buckets */
  }
  return buckets.map(({ name, calls, handled }) => ({ name, calls, handled }));
}

export async function getRevenueSeries(
  businessId: string,
  avgValue: number
): Promise<{ series: Array<{ name: string; revenue: number }>; total: number }> {
  const series = Array.from({ length: 4 }, (_, i) => ({
    name: `W${i + 1}`,
    revenue: 0,
    start: new Date(Date.now() - (4 - i) * 7 * DAY_MS),
    end: new Date(Date.now() - (3 - i) * 7 * DAY_MS),
  }));
  try {
    const { data, error } = await supabaseAdmin
      .from("conversations")
      .select("created_at, appointment_requested")
      .eq("business_id", businessId)
      .eq("appointment_requested", true)
      .gte("created_at", nDaysAgo(28));
    if (!error && data) {
      for (const row of data as Array<{ created_at: string }>) {
        const t = new Date(row.created_at).getTime();
        const bucket = series.find((s) => t >= s.start.getTime() && t < s.end.getTime());
        if (bucket) bucket.revenue += avgValue;
      }
    }
  } catch {
    /* fall through */
  }
  const out = series.map(({ name, revenue }) => ({ name, revenue }));
  const total = out.reduce((a, b) => a + b.revenue, 0);
  return { series: out, total };
}

export async function getActiveCampaigns(businessId: string): Promise<Campaign[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("campaigns")
      .select("id, name, type, status, recipients_count, open_count, click_count, appointments_booked")
      .eq("business_id", businessId)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as Campaign[];
  } catch {
    return [];
  }
}

export async function getAfterHoursCount(
  businessId: string
): Promise<{ count: number; pct: number }> {
  const sinceIso = nDaysAgo(30);
  const total = await safeCount((q) =>
    q.select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", sinceIso)
  );
  const count = await safeCount((q) =>
    q.select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("is_after_hours", true)
      .gte("created_at", sinceIso)
  );
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return { count, pct };
}

export async function getUrgencyBreakdown(
  businessId: string
): Promise<{ emergency: number; urgent: number; routine: number }> {
  const base = { emergency: 0, urgent: 0, routine: 0 };
  try {
    const { data, error } = await supabaseAdmin
      .from("conversations")
      .select("urgency")
      .eq("business_id", businessId)
      .gte("created_at", nDaysAgo(30));
    if (error || !data) return base;
    for (const row of data as Array<{ urgency: "emergency" | "urgent" | "routine" | null }>) {
      const key = row.urgency ?? "routine";
      if (key in base) base[key]++;
    }
  } catch {
    /* fall through */
  }
  return base;
}

export async function getPeakContactHours(
  businessId: string
): Promise<Array<{ hour: number; count: number }>> {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
  try {
    const { data, error } = await supabaseAdmin
      .from("conversations")
      .select("created_at")
      .eq("business_id", businessId)
      .gte("created_at", nDaysAgo(30));
    if (error || !data) return buckets;
    for (const row of data as Array<{ created_at: string }>) {
      const h = new Date(row.created_at).getHours();
      buckets[h].count++;
    }
  } catch {
    /* fall through */
  }
  return buckets;
}

export async function getEmergencyFlagCount(
  businessId: string
): Promise<{ count: number; recent: Array<{ id: string; created_at: string; channel: string }> }> {
  const sinceIso = nDaysAgo(30);
  const count = await safeCount((q) =>
    q.select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("urgency", "emergency")
      .gte("created_at", sinceIso)
  );
  let recent: Array<{ id: string; created_at: string; channel: string }> = [];
  try {
    const { data } = await supabaseAdmin
      .from("conversations")
      .select("id, created_at, channel")
      .eq("business_id", businessId)
      .eq("urgency", "emergency")
      .order("created_at", { ascending: false })
      .limit(3);
    recent = (data as typeof recent) ?? [];
  } catch {
    /* fall through */
  }
  return { count, recent };
}
