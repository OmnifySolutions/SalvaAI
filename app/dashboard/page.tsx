import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

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

  const interactionLimit = business.plan === "basic" ? 500 : "Unlimited";
  const usagePercent =
    business.plan === "basic"
      ? Math.min(100, Math.round((business.interaction_count / 500) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-blue-600 text-lg">HustleClaude</span>
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

        {/* Usage bar (basic plan only) */}
        {business.plan === "basic" && (
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
                You&apos;re nearing your limit. <Link href="/billing" className="underline">Upgrade to Pro</Link> for unlimited interactions.
              </p>
            )}
          </div>
        )}

        {/* Embed code */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Embed Your Widget</h2>
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
