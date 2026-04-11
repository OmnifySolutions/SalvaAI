import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const businessId = searchParams.get("id");

  if (!businessId) {
    return new Response("// Missing business id", {
      status: 400,
      headers: { "Content-Type": "application/javascript" },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const widgetUrl = `${appUrl}/widget/${businessId}`;

  const js = `
(function() {
  if (window.__hustleclaude) return;
  window.__hustleclaude = true;

  var btn = document.createElement('button');
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" /></svg>';
  btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:#2563eb;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(37,99,235,0.4);display:flex;align-items:center;justify-content:center;z-index:9999;transition:transform 0.2s';
  btn.onmouseenter = function() { btn.style.transform = 'scale(1.1)'; };
  btn.onmouseleave = function() { btn.style.transform = 'scale(1)'; };

  var iframe = document.createElement('iframe');
  iframe.src = '${widgetUrl}';
  iframe.style.cssText = 'position:fixed;bottom:88px;right:20px;width:360px;height:520px;border:none;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.15);z-index:9998;display:none;transition:opacity 0.2s,transform 0.2s;opacity:0;transform:translateY(8px)';
  iframe.allow = 'microphone';
  iframe.title = 'AI Receptionist';

  var open = false;
  btn.onclick = function() {
    open = !open;
    if (open) {
      iframe.style.display = 'block';
      setTimeout(function() {
        iframe.style.opacity = '1';
        iframe.style.transform = 'translateY(0)';
      }, 10);
    } else {
      iframe.style.opacity = '0';
      iframe.style.transform = 'translateY(8px)';
      setTimeout(function() { iframe.style.display = 'none'; }, 200);
    }
  };

  document.body.appendChild(iframe);
  document.body.appendChild(btn);
})();
`.trim();

  return new Response(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
