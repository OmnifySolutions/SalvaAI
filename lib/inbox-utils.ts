export type InboxItem = {
  id: string;
  channel: "voice" | "chat";
  urgency: "emergency" | "urgent" | "routine";
  appointment_requested: boolean;
  appointment_booked_status: string | null;
  callback_requested: boolean;
  visitor_name: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  summary: string | null;
  appointment_notes: string | null;
  location_name: string | null;
  created_at: string;
};

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function callerLabel(item: Pick<InboxItem, "visitor_name" | "visitor_phone" | "visitor_email">): string {
  return item.visitor_name ?? item.visitor_phone ?? item.visitor_email ?? "Unknown caller";
}

export function sortByPriority<T extends Pick<InboxItem, "urgency" | "appointment_requested" | "appointment_booked_status">>(items: T[]): T[] {
  const priority = (c: T) => {
    if (c.urgency === "emergency") return 0;
    if (c.appointment_requested && c.appointment_booked_status !== "confirmed") return 1;
    return 2;
  };
  return [...items].sort((a, b) => priority(a) - priority(b));
}

// Stable color assignment for location names — module-level so it persists across re-renders
const LOCATION_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
  "bg-cyan-100 text-cyan-700",
] as const;

const locationColorCache = new Map<string, string>();

export function getLocationColor(name: string): string {
  if (!locationColorCache.has(name)) {
    locationColorCache.set(name, LOCATION_COLORS[locationColorCache.size % LOCATION_COLORS.length]);
  }
  return locationColorCache.get(name)!;
}
