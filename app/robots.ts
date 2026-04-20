import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/how-it-works", "/pricing", "/privacy", "/terms", "/baa", "/setup", "/voice-test"],
        disallow: ["/dashboard", "/settings", "/onboarding", "/sign-in", "/sign-up", "/api/"],
      },
    ],
    sitemap: "https://salvaai.com/sitemap.xml",
  };
}
