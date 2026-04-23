"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignUpForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const billing = searchParams.get("billing") || "annual";
  const afterUrl = plan ? `/onboarding?plan=${plan}&billing=${billing}` : "/onboarding";

  return <SignUp forceRedirectUrl={afterUrl} />;
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<div />}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
