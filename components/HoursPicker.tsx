"use client";

export type DayHours = { enabled: boolean; open: string; close: string };
export type WeeklyHours = {
  mon: DayHours; tue: DayHours; wed: DayHours; thu: DayHours;
  fri: DayHours; sat: DayHours; sun: DayHours;
};
type DayKey = keyof WeeklyHours;

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

// 30-min increments 06:00 – 22:00
const TIMES: string[] = [];
for (let h = 6; h <= 22; h++) {
  TIMES.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 22) TIMES.push(`${String(h).padStart(2, "0")}:30`);
}

export const DEFAULT_HOURS: WeeklyHours = {
  mon: { enabled: true,  open: "09:00", close: "17:00" },
  tue: { enabled: true,  open: "09:00", close: "17:00" },
  wed: { enabled: true,  open: "09:00", close: "17:00" },
  thu: { enabled: true,  open: "09:00", close: "17:00" },
  fri: { enabled: true,  open: "09:00", close: "17:00" },
  sat: { enabled: true,  open: "09:00", close: "13:00" },
  sun: { enabled: false, open: "09:00", close: "17:00" },
};

/** Safely converts any stored hours value (old string or new object) to WeeklyHours. */
export function parseHours(raw: unknown): WeeklyHours {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if ("mon" in obj && "fri" in obj) return raw as WeeklyHours;
  }
  return { ...DEFAULT_HOURS };
}

interface Props {
  value: WeeklyHours;
  onChange: (hours: WeeklyHours) => void;
}

export default function HoursPicker({ value, onChange }: Props) {
  function toggleDay(key: DayKey, enabled: boolean) {
    onChange({ ...value, [key]: { ...value[key], enabled } });
  }

  function setTime(key: DayKey, field: "open" | "close", time: string) {
    onChange({ ...value, [key]: { ...value[key], [field]: time } });
  }

  return (
    <div className="divide-y divide-gray-100">
      {DAYS.map(({ key, label }) => {
        const day = value[key];
        return (
          <div key={key} className="flex items-center gap-3 py-3">
            {/* Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={day.enabled}
              aria-label={`${label} open`}
              onClick={() => toggleDay(key, !day.enabled)}
              className={`relative w-9 h-5 rounded-full transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                day.enabled ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                  day.enabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>

            {/* Day label */}
            <span className={`w-24 text-sm font-medium shrink-0 ${day.enabled ? "text-gray-700" : "text-gray-400"}`}>
              {label}
            </span>

            {/* Times or closed indicator */}
            {day.enabled ? (
              <div className="flex items-center gap-2">
                <select
                  value={day.open}
                  onChange={(e) => setTime(key, "open", e.target.value)}
                  className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
                >
                  {TIMES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className="text-xs text-gray-400 shrink-0">to</span>
                <select
                  value={day.close}
                  onChange={(e) => setTime(key, "close", e.target.value)}
                  className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
                >
                  {TIMES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-sm text-gray-400">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
