import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const EXT_MAP: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/svg+xml": "svg",
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (businessError || !business) {
      return Response.json({ error: "Business not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: "Invalid file type. Allowed: PNG, JPEG, JPG, SVG" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: "File too large. Maximum size is 2MB" },
        { status: 400 }
      );
    }

    const ext = EXT_MAP[file.type];
    const path = `${business.id}/logo.${ext}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("widget-logos")
      .upload(path, fileBuffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("Logo upload error:", uploadError);
      return Response.json({ error: "Failed to upload logo" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("widget-logos")
      .getPublicUrl(path);

    return Response.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("Unexpected error in upload-logo:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
