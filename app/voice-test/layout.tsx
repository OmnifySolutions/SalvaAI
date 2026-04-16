import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try Our Voice AI",
  description:
    "Test Salva AI's voice receptionist live. Hear how it sounds before you commit — no sign-up required.",
  alternates: { canonical: "/voice-test" },
  robots: { index: true, follow: true },
};

export default function VoiceTestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
