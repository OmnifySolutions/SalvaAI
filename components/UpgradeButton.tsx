"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  plan?: "basic" | "pro" | "growth" | "multi";
  billingCycle?: "annual" | "monthly";
  mode?: "checkout" | "portal";
  className?: string;
  children: React.ReactNode;
}

export default function UpgradeButton({
  plan,
  billingCycle = "annual",
  mode = "checkout",
  className,
  children,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        mode === "portal" ? "/api/stripe/portal" : "/api/stripe/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mode === "checkout" ? { plan, billingCycle } : {}),
        }
      );

      if (res.status === 401) {
        router.push(`/sign-in?redirect_url=/pricing`);
        return;
      }

      if (res.status === 404) {
        router.push("/onboarding");
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button onClick={handleClick} disabled={loading} className={className}>
        {loading ? "Loading…" : children}
      </button>
      {error && (
        <p className="text-red-500 text-xs text-center max-w-xs">{error}</p>
      )}
    </div>
  );
}
