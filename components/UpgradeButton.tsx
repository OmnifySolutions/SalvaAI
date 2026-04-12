"use client";

import { useState } from "react";

interface Props {
  plan?: "basic" | "pro" | "multi";
  mode?: "checkout" | "portal";
  className?: string;
  children: React.ReactNode;
}

export default function UpgradeButton({
  plan,
  mode = "checkout",
  className,
  children,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(
        mode === "portal" ? "/api/stripe/portal" : "/api/stripe/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mode === "checkout" ? { plan } : {}),
        }
      );
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Stripe redirect error:", data.error);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Loading…" : children}
    </button>
  );
}
