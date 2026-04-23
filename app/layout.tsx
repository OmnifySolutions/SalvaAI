import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import SupportChat from "@/components/SupportChat";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://getsalvaai.com"),
  title: {
    default: "Salva AI — AI Receptionist for Dental Offices",
    template: "%s | Salva AI",
  },
  description:
    "24/7 AI receptionist and chat widget for dental practices. Answer every new-patient call, book appointments, and sync with your practice management software.",
  keywords: [
    "AI receptionist",
    "dental answering service",
    "dental AI",
    "new patient calls",
    "OpenDental",
    "dental chat widget",
    "AI phone answering",
  ],
  openGraph: {
    title: "Salva AI — AI Receptionist for Dental Offices",
    description:
      "24/7 AI answers calls and chats for your dental practice. Never miss a new patient.",
    url: "https://getsalvaai.com",
    siteName: "Salva AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salva AI — AI Receptionist for Dental Offices",
    description: "24/7 AI receptionist for dental offices. Answer every call, book more patients.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
          <SupportChat />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
