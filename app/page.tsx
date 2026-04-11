import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="font-bold text-blue-600 text-xl">HustleClaude</span>
        <div className="flex gap-3">
          <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          AI Receptionist for Dental Offices
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Never miss a new patient call again
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
          Your AI receptionist answers questions 24/7, books appointments, and handles common
          inquiries — so your staff can focus on patients in the chair.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/sign-up"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Start 30-day free trial
          </Link>
          <p className="text-sm text-gray-400">No credit card required</p>
        </div>

        {/* Social proof */}
        <div className="mt-20 grid grid-cols-3 gap-12 text-center border-t border-gray-100 pt-12 w-full">
          <div>
            <div className="text-3xl font-bold text-gray-800">$200+</div>
            <div className="text-sm text-gray-500 mt-1">lost per missed call</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-800">24/7</div>
            <div className="text-sm text-gray-500 mt-1">always available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-800">2 min</div>
            <div className="text-sm text-gray-500 mt-1">setup time</div>
          </div>
        </div>
      </main>
    </div>
  );
}
