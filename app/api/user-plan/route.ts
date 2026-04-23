import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ userId: null, plan: null });
    }

    const { data } = await supabaseAdmin
      .from("businesses")
      .select("plan")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    const plan = data?.plan ?? "free";

    return NextResponse.json({ userId, plan });
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return NextResponse.json({ userId: null, plan: null }, { status: 500 });
  }
}
