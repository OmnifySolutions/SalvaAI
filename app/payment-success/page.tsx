"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-medium">Activating your plan…</p>
        <p className="text-gray-500 text-sm mt-2">This only takes a moment.</p>
      </div>
    </div>
  );
}

function PaymentSuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const verified = useRef(false);

  useEffect(() => {
    if (!isLoaded || verified.current) return;
    verified.current = true;

    const sessionId = params.get("session_id");

    async function finalize() {
      if (sessionId) {
        await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      }

      if (isSignedIn) {
        router.replace("/dashboard?upgraded=true");
      } else {
        router.replace("/sign-in?redirect_url=/dashboard%3Fupgraded%3Dtrue");
      }
    }

    finalize();
  }, [isLoaded, isSignedIn, params, router]);

  return <Spinner />;
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PaymentSuccessInner />
    </Suspense>
  );
}
