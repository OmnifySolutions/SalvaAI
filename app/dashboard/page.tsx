import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import UpgradeButton from "@/components/UpgradeButton";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Get this user's business
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (!business) redirect("/onboarding");

  // Get recent conversations with message counts
  const { data: conversations } = await supabaseAdmin
    .from("conversations")
    .select("id, channel, status, created_at, ended_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const embedCode = `<script src="${appUrl}/api/widget/embed?id=${business.id}"></script>`;

  const interactionLimit = business.plan === "free" ? 50 : "Unlimited";
  const usagePercent =
    business.plan === "free"
      ? Math.min(100, Math.round((business.interaction_count / 50) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-gray-900 text-lg">HustleClaude</Link>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{business.name}</span>
          <Link href="/settings" className="text-gray-500 hover:text-gray-700 text-sm">Settings</Link>
          <SignOutButton />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Interactions" value={business.interaction_count} />
          <StatCard label="Plan" value={business.plan.charAt(0).toUpperCase() + business.plan.slice(1)} />
          <StatCard label="Conversations" value={conversations?.length ?? 0} />
        </div>

        {/* Billing */}
        {business.plan_status === "past_due" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-red-700 text-sm">Payment failed</p>
              <p className="text-xs text-red-400 mt-0.5">Update your billing info to restore full access.</p>
            </div>
            <UpgradeButton
              mode="portal"
              className="shrink-0 text-sm bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Update billing
            </UpgradeButton>
          </div>
        )}

        {business.plan === "free" && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800 text-sm">You&apos;re on the Free plan</p>
              <p className="text-xs text-gray-500 mt-0.5">Upgrade to remove branding and unlock more interactions.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <UpgradeButton
                plan="basic"
                className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Basic — $49/mo
              </UpgradeButton>
              <UpgradeButton
                plan="pro"
                className="text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-lg font-medium hover:border-gray-400 transition-colors disabled:opacity-50"
              >
                Pro — $189/mo
              </UpgradeButton>
            </div>
          </div>
        )}

        {/* Open Dental nudge — shown to Pro/Multi without OD connected */}
        {(business.plan === "pro" || business.plan === "multi") && !business.opendental_api_key && (
          <div className="border border-blue-100 bg-blue-50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Enable Live Appointment Booking</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Connect Open Dental so your AI can check availability and book appointments directly during calls.
              </p>
            </div>
            <Link
              href="/settings#practice-management"
              className="shrink-0 text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-center"
            >
              Connect in Settings →
            </Link>
          </div>
        )}

        {business.plan === "basic" && business.plan_status !== "past_due" && (
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Basic plan</p>
              <p className="text-xs text-gray-400 mt-0.5">Upgrade to Pro for unlimited interactions + voice AI</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <UpgradeButton
                plan="pro"
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Upgrade to Pro
              </UpgradeButton>
              <UpgradeButton
                mode="portal"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                Manage subscription
              </UpgradeButton>
            </div>
          </div>
        )}

        {business.plan === "pro" && business.plan_status !== "past_due" && (
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Pro plan</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {business.plan_status === "trialing" ? "Trial" : "Active"}
              </span>
            </div>
            <UpgradeButton
              mode="portal"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              Manage subscription
            </UpgradeButton>
          </div>
        )}

        {/* Usage bar (free plan only) */}
        {business.plan === "free" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Monthly Usage</span>
              <span className="text-gray-500">
                {business.interaction_count} / {interactionLimit}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${usagePercent > 80 ? "bg-red-500" : "bg-blue-500"}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            {usagePercent > 80 && (
              <p className="text-xs text-red-500 mt-2">
                You&apos;re nearing your limit. <Link href="/pricing" className="underline">Upgrade to Pro</Link> for unlimited interactions.
              </p>
            )}
          </div>
        )}

        {/* Embed code */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-800">Embed Your Widget</h2>
            <Link href="/setup" className="text-xs text-blue-500 hover:text-blue-600 transition-colors">
              Setup guide →
            </Link>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            Paste this one line of code before the{" "}
            <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag on your website.
          </p>
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs overflow-x-auto select-all">
            {embedCode}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Or preview it:{" "}
            <Link
              href={`/widget/${business.id}`}
              target="_blank"
              className="text-blue-500 underline"
            >
              Open widget →
            </Link>
          </p>
        </div>

        {/* Voice AI status */}
        {(business.plan === "pro" || business.plan === "multi") ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Voice AI</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                business.voice_enabled
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {business.voice_enabled ? "Active" : "Inactive"}
              </span>
            </div>
            {business.twilio_sid ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Your forwarding number</p>
                  <p className="text-sm font-mono text-gray-800">{business.twilio_sid}</p>
                </div>
                <Link href="/settings" className="text-xs text-blue-500 hover:text-blue-600">
                  Configure →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Your dedicated phone number is being provisioned.{" "}
                <Link href="/settings" className="text-blue-500 hover:underline">Configure in settings →</Link>
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Unlock Voice AI</p>
              <p className="text-xs text-gray-500 mt-0.5">Answer calls 24/7 automatically. Never miss a new patient.</p>
            </div>
            <UpgradeButton
              plan="pro"
              className="shrink-0 text-sm bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Upgrade to Pro — $189/mo
            </UpgradeButton>
          </div>
        )}

        {/* Conversations list */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Conversations</h2>
            <span className="text-xs text-gray-400">Last 20</span>
          </div>
          {!conversations || conversations.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              No conversations yet. Embed your widget to start receiving messages.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {conversations.map((conv) => (
                <li key={conv.id} className="px-5 py-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${conv.status === "active" ? "bg-green-400" : "bg-gray-300"}`}
                    />
                    <span className="font-medium text-gray-700 capitalize">{conv.channel}</span>
                    <span className="text-gray-400">
                      {new Date(conv.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      conv.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {conv.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}
