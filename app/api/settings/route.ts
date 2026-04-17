import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name, businessType, hours, services,
    aiName, aiGreeting, customPrompt, faqs, aiDos, aiDonts, voiceEnabled,
    voiceTone, voiceEmergencyNumber, voiceEmergencyMessage,
    voiceDeflectTopics, voiceScenarios,
    openDentalServerUrl, openDentalApiKey, openDentalBookingMode, openDentalBookingWindow,
  } = body;

  const validModes = ['autonomous', 'pending', 'collect_only'];
  const validWindows = [3, 7, 14];
  if (openDentalBookingMode && !validModes.includes(openDentalBookingMode)) {
    return Response.json({ error: "Invalid booking mode" }, { status: 400 });
  }
  if (openDentalBookingWindow != null && !validWindows.includes(Number(openDentalBookingWindow))) {
    return Response.json({ error: "Invalid booking window" }, { status: 400 });
  }

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
      ai_dos: aiDos ?? null,
      ai_donts: aiDonts ?? null,
      voice_enabled: voiceEnabled ?? false,
      voice_tone: voiceTone ?? "professional",
      voice_emergency_number: voiceEmergencyNumber ?? null,
      voice_emergency_message: voiceEmergencyMessage ?? null,
      voice_deflect_topics: voiceDeflectTopics ?? [],
      voice_scenarios: voiceScenarios ?? [],
      opendental_server_url: openDentalServerUrl?.trim() || null,
      opendental_api_key: openDentalApiKey?.trim() || null,
      opendental_booking_mode: openDentalBookingMode ?? 'autonomous',
      opendental_booking_window: openDentalBookingWindow ?? 7,
    })
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("Settings update error:", error);
    return Response.json({ error: "Failed to save settings" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
