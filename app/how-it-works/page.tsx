import type { Metadata } from "next";
import HowItWorksPage from "./client";

export const metadata: Metadata = {
  title: "How It Works — Full Product Tour | Salva AI",
  description:
    "Dashboard analytics, 8 AI behavior toggles, inbox notifications, voice settings, Do's & Don'ts, and integrations — every feature explained for dental practices.",
  alternates: { canonical: "/how-it-works" },
};

export default function Page() {
  return <HowItWorksPage />;
}
