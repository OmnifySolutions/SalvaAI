import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name, businessType, hours, services,
    aiName, aiGreeting, customPrompt, faqs, voiceEnabled,
    voiceTone, voiceEmergencyNumber, voiceEmergencyMessage,
    voiceDeflectTopics, voiceScenarios,
  } = body;

  if (!name?.trim()) return Response.json({ error: "Business name required" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("businesses")
    .update({
      name: name.trim(),
      business_type: businessType,
      hours,
      services,
      ai_name: aiName,
      ai_greeting: aiGreeting,
      custom_prompt: customPrompt,
      faqs: faqs ?? [],
      voice_enabled: voiceEnabled ?? false,
      voice_tone: voiceTone ?? "professional",
      voice_emergency_number: voiceEmergencyNumber ?? null,
      voice_emergency_message: voiceEmergencyMessage ?? null,
      voice_deflect_topics: voiceDeflectTopics ?? [],
      voice_scenarios: voiceScenarios ?? [],
    })
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("Settings update error:", error);
    return Response.json({ error: "Failed to save settings" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
