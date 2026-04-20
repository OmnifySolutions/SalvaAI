import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import FloatingChatWidget from "@/components/FloatingChatWidget";

export default async function SupportChat() {
  const { userId } = await auth();
  if (!userId) return null;

  // Get this user's business ID to identify them in support
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!business) return null;

  return <FloatingChatWidget businessId={process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID ?? business.id} />;
}
