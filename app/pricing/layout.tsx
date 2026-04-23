import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dental AI Receptionist Pricing — Transparent Plans Starting at $65/mo",
  description:
    "Simple, transparent pricing for dental AI receptionists. Basic plan at $65/mo annual. Pro voice AI at $249/mo annual. 14-day free trial, cancel anytime.",
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
