"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SettingsTooltip from "./SettingsTooltip";

export default function DashboardOnboardingFlag() {
  const params = useSearchParams();
  const [justOnboarded, setJustOnboarded] = useState(false);

  useEffect(() => {
    if (params.get("onboarded") === "1") {
      setJustOnboarded(true);
      // clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("onboarded");
      window.history.replaceState({}, "", url.toString());
    }
  }, [params]);

  return <SettingsTooltip justOnboarded={justOnboarded} />;
}
