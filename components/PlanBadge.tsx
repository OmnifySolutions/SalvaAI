import Link from "next/link";

const PLAN_CONFIG = {
  free:  { label: "Free",           color: "bg-gray-100 text-gray-600 border-gray-200" },
  basic: { label: "Basic",          color: "bg-blue-50 text-blue-700 border-blue-200" },
  pro:   { label: "Pro",            color: "bg-orange-50 text-orange-700 border-orange-300" },
  growth:{ label: "Growth",         color: "bg-purple-50 text-purple-700 border-purple-300" },
  multi: { label: "Multi-Practice", color: "bg-amber-50 text-amber-700 border-amber-300" },
} as const;

type Props = {
  plan: string;
  planStatus?: string;
};

export default function PlanBadge({ plan, planStatus }: Props) {
  const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG] ?? PLAN_CONFIG.free;
  const isTrial = planStatus === "trialing";
  const isFree = plan === "free";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${config.color}`}
      >
        {!isFree && (
          <span className="text-[10px]">✦</span>
        )}
        {config.label}
        {isTrial && (
          <span className="ml-1 bg-white/60 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
            Trial
          </span>
        )}
      </div>
      {isFree && (
        <Link
          href="/pricing"
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2"
        >
          Upgrade
        </Link>
      )}
    </div>
  );
}
