"use client";

import { Suspense } from "react";
import ConfirmDeletionContent from "./content";

export default function ConfirmDeletionPage() {
  return (
    <Suspense fallback={<ConfirmDeletionFallback />}>
      <ConfirmDeletionContent />
    </Suspense>
  );
}

function ConfirmDeletionFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 px-8 py-6 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
          <span className="text-white font-black text-lg tracking-tight">Salva AI</span>
        </div>
        <div className="px-8 py-10 text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-5" />
          <h2 className="text-xl font-black text-gray-900 mb-2">Processing...</h2>
        </div>
      </div>
    </div>
  );
}
