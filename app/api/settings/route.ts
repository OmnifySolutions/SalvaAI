import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { VALID_FEATURE_KEYS } from "@/lib/ai-features";
import { verifyLocationOwnership } from "@/lib/organizations";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name, businessType, hours, services,
    aiName, aiGreeting, customPrompt, faqs, aiDos, aiDonts, aiFeatures, voiceEnabled,
    voiceTone, voiceEmergencyNumber, voiceEmergencyMessage,
    voiceDeflectTopics, voiceScenarios,
    openDentalServerUrl, openDentalApiKey, openDentalBookingWindow,
    notifyOnEmergency, notifyEmergencyPhone, notifyEmergencyEmail, notifyEmergencyWhatsapp,
    notifyOnNewBooking, notifyOnCallback,
    widget_config,
    businessId: targetBusinessId,
  } = body;

  const validWindows = [3, 7, 14];
  if (openDentalBookingWindow != null && !validWindows.includes(Number(openDentalBookingWindow))) {
    return Response.json({ error: "Invalid booking window" }, { status: 400 });
  }

  const safeFeatures = Array.isArray(aiFeatures)
    ? aiFeatures.filter((k: string) => VALID_FEATURE_KEYS.has(k))
    : [];
  const bookingMode = safeFeatures.includes('instant_booking') ? 'autonomous' : 'pending';

  if (widget_config?.show_branding === false) {
    const { data: biz } = await supabaseAdmin
      .from("businesses")
      .select("plan")
      .eq(targetBusinessId ? "id" : "clerk_user_id", targetBusinessId ?? userId)
      .single();
    if (biz?.plan === "basic") {
      return Response.json({ error: "Removing SalvaAI branding requires a Pro plan or higher." }, { status: 403 });
    }
  }

  if (!name?.trim()) return Response.json({ error: "Business name required" }, { status: 400 });

  let updateById: string | null = null;
  if (targetBusinessId) {
    const { owned } = await verifyLocationOwnership(userId, targetBusinessId);
    if (!owned) return Response.json({ error: "Location not found in your organization" }, { status: 403 });
    updateById = targetBusinessId;
  }

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
      ai_features: safeFeatures,
      voice_enabled: voiceEnabled ?? false,
      voice_tone: voiceTone ?? "professional",
      voice_emergency_number: voiceEmergencyNumber ?? null,
      voice_emergency_message: voiceEmergencyMessage ?? null,
      voice_deflect_topics: voiceDeflectTopics ?? [],
      voice_scenarios: voiceScenarios ?? [],
      opendental_server_url: openDentalServerUrl?.trim() || null,
      opendental_api_key: openDentalApiKey?.trim() || null,
      opendental_booking_mode: bookingMode,
      opendental_booking_window: openDentalBookingWindow ?? 7,
      notify_on_emergency: notifyOnEmergency ?? true,
      notify_emergency_phone: notifyEmergencyPhone?.trim() || null,
      notify_emergency_email: notifyEmergencyEmail?.trim() || null,
      notify_emergency_whatsapp: notifyEmergencyWhatsapp?.trim() || null,
      notify_on_new_booking: notifyOnNewBooking ?? false,
      notify_on_callback: notifyOnCallback ?? false,
      ...(widget_config !== undefined && { widget_config }),
    })
    .eq(updateById !== null ? "id" : "clerk_user_id", updateById ?? userId);

  if (error) {
    console.error("Settings update error:", error);
    return Response.json({ error: "Failed to save settings" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
