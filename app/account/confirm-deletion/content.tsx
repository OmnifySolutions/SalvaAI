"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";

export default function ConfirmDeletionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signOut } = useClerk();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"pending" | "deleting" | "done" | "error">("pending");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setErrorMsg("Invalid or missing token."); return; }
    setStatus("deleting");

    fetch("/api/account/confirm-deletion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Deletion failed");
        setStatus("done");
        setTimeout(() => signOut(() => router.push("/")), 3000);
      })
      .catch((e) => { setStatus("error"); setErrorMsg(e.message); });
  }, [token, signOut, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="bg-gray-900 px-8 py-6 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
          <span className="text-white font-black text-lg tracking-tight">Salva AI</span>
        </div>

        <div className="px-8 py-10 text-center">
          {status === "deleting" && (
            <>
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-5" />
              <h2 className="text-xl font-black text-gray-900 mb-2">Deleting your account...</h2>
              <p className="text-gray-500 text-sm">This will only take a moment.</p>
            </>
          )}

          {status === "done" && (
            <>
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">Account deleted</h2>
              <p className="text-gray-500 text-sm mb-1">Your account and data have been scheduled for removal.</p>
              <p className="text-gray-400 text-xs">Signing you out and redirecting...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">Link expired or invalid</h2>
              <p className="text-gray-500 text-sm mb-6">{errorMsg || "This link has already been used or has expired. Please request a new deletion email from your account settings."}</p>
              <Link href="/settings" className="inline-block bg-gray-900 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">
                Back to Settings
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
