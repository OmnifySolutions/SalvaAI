import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Guide",
  description:
    "Add Salva AI to your dental practice website in under 5 minutes. Step-by-step guide for Squarespace, Wix, WordPress, and custom HTML sites.",
  alternates: { canonical: "/setup" },
  robots: { index: true, follow: true },
};

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
