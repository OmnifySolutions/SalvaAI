import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

const RESEND_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "support@getsalvaai.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: business, error } = await supabaseAdmin
    .from("businesses")
    .select("id, name, stripe_subscription_id, deletion_requested_at")
    .eq("clerk_user_id", userId)
    .single();

  if (error || !business) return Response.json({ error: "Account not found" }, { status: 404 });

  // Throttle: one request per hour
  if (business.deletion_requested_at) {
    const requested = new Date(business.deletion_requested_at).getTime();
    if (Date.now() - requested < 60 * 60 * 1000) {
      return Response.json({ error: "A deletion email was already sent. Check your inbox or wait 1 hour to resend." }, { status: 429 });
    }
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabaseAdmin
    .from("businesses")
    .update({ deletion_token: token, deletion_requested_at: expiresAt })
    .eq("id", business.id);

  if (updateError) return Response.json({ error: "Failed to initiate deletion" }, { status: 500 });

  // Get user email from Clerk
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return Response.json({ error: "No email address on file" }, { status: 400 });

  const confirmUrl = `${APP_URL}/account/confirm-deletion?token=${token}`;

  if (RESEND_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: email,
        subject: "Confirm account deletion — Salva AI",
        html: buildEmail(business.name, confirmUrl),
      }),
    }).catch((e) => console.error("Deletion email error:", e));
  }

  return Response.json({ ok: true });
}

function buildEmail(practiceName: string, confirmUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#111827;padding:28px 40px;">
            <div style="display:inline-flex;align-items:center;gap:8px;">
              <div style="width:10px;height:10px;background:#f97316;border-radius:50%;"></div>
              <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.5px;">Salva AI</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;letter-spacing:-0.5px;">Confirm account deletion</h1>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              You requested to delete your Salva AI account for <strong style="color:#111827;">${practiceName}</strong>.
            </p>

            <!-- Warning box -->
            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#c2410c;text-transform:uppercase;letter-spacing:0.5px;">What will be deleted</p>
              <ul style="margin:0;padding-left:18px;color:#9a3412;font-size:14px;line-height:1.8;">
                <li>All AI configuration and settings</li>
                <li>All patient conversations and inbox history</li>
                <li>Your active subscription will be cancelled</li>
                <li>Your Salva AI account and login</li>
              </ul>
            </div>

            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">This link expires in <strong>24 hours</strong>. If you did not request this, you can safely ignore this email.</p>

            <!-- CTA Button -->
            <a href="${confirmUrl}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;padding:14px 32px;border-radius:10px;letter-spacing:-0.2px;">
              Yes, delete my account
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              Salva AI · <a href="https://getsalvaai.com" style="color:#9ca3af;">getsalvaai.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
