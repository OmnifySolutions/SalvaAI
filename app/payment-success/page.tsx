"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace("/dashboard?upgraded=true");
    } else {
      router.replace("/sign-in?redirect_url=/dashboard?upgraded=true");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-medium">Setting up your account…</p>
      </div>
    </div>
  );
}
