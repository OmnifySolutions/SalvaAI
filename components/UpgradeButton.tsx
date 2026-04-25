"use client";

import { useRouter } from "next/navigation";
import type { PlanType, BillingCycle } from "@/lib/stripe";

interface Props {
  plan: PlanType;
  billingCycle?: BillingCycle;
  className?: string;
  children: React.ReactNode;
}

export default function UpgradeButton({
  plan,
  billingCycle = "annual",
  className,
  children,
}: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/checkout?plan=${plan}&billing=${billingCycle}`)}
      className={className}
    >
      {children}
    </button>
  );
}
