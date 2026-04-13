import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// Tests an Open Dental API key by calling /providers.
// Returns { ok: true } on success or { error: string } on failure.
// Does NOT save the key — for UI validation only.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { serverUrl, apiKey } = await req.json();
  if (!serverUrl?.trim() || !apiKey?.trim()) {
    return Response.json({ error: "Server URL and API key are required" }, { status: 400 });
  }

  const developerKey = process.env.OPENDENTAL_DEVELOPER_KEY;
  if (!developerKey) {
    return Response.json({ error: "Developer key not configured on server" }, { status: 500 });
  }

  const base = serverUrl.trim().replace(/\/$/, "");
  const url = `${base}/api/v1/providers`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `ODFHIR ${developerKey}/${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: `Could not reach Open Dental server: ${msg}` }, { status: 200 });
  }

  if (res.status === 401 || res.status === 403) {
    return Response.json({ error: "Invalid API key — Open Dental rejected the credentials" }, { status: 200 });
  }
  if (!res.ok) {
    return Response.json({ error: `Open Dental returned ${res.status}` }, { status: 200 });
  }

  return Response.json({ ok: true });
}
