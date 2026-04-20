import type { Metadata } from "next";
import HowItWorksPage from "./client";

export const metadata: Metadata = {
  title: "How It Works — Full Product Tour | Salva AI",
  description:
    "See exactly how Salva AI answers every patient call, handles after-hours inquiries, books appointments, and flags dental emergencies — all without adding staff.",
  alternates: { canonical: "/how-it-works" },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Salva AI",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "AI receptionist for dental practices — answers calls 24/7, books appointments, and handles patient inquiries automatically.",
            offers: {
              "@type": "AggregateOffer",
              lowPrice: "0",
              highPrice: "749",
              priceCurrency: "USD",
            },
          }),
        }}
      />
      <HowItWorksPage />
    </>
  );
}
