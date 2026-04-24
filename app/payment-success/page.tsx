"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

function Spinner({ message = "Activating your plan…" }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-medium">{message}</p>
        <p className="text-gray-500 text-sm mt-2">This only takes a moment.</p>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center max-w-sm">
        <p className="text-white text-lg font-medium mb-2">Plan activation failed</p>
        <p className="text-gray-400 text-sm mb-6">
          Your payment went through but we couldn&apos;t activate your plan. Please try again or contact support.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold"
          >
            Retry
          </button>
          <a
            href="/dashboard"
            className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-lg text-sm font-semibold"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

function PaymentSuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const verified = useRef(false);
  const [failed, setFailed] = useState(false);

  async function finalize() {
    setFailed(false);
    const sessionId = params.get("session_id");

    if (sessionId) {
      try {
        const res = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (!res.ok) {
          setFailed(true);
          return;
        }
      } catch {
        setFailed(true);
        return;
      }
    }

    if (isSignedIn) {
      router.replace("/dashboard?upgraded=true");
    } else {
      router.replace("/sign-in?redirect_url=/dashboard%3Fupgraded%3Dtrue");
    }
  }

  useEffect(() => {
    if (!isLoaded || verified.current) return;
    verified.current = true;
    finalize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  if (failed) return <ErrorState onRetry={() => { verified.current = false; finalize(); }} />;
  return <Spinner />;
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PaymentSuccessInner />
    </Suspense>
  );
}
