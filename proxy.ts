import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/how-it-works",
  "/faq",
  "/privacy",
  "/terms",
  "/baa",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/widget/(.*)",
  "/api/chat",
  "/api/widget/(.*)",
  "/api/webhooks/(.*)",
  "/api/stripe/webhook",
  "/api/voice/(.*)",
  "/setup(.*)",
  "/payment-success(.*)",
  "/api/stripe/verify-session",
  "/api/account/confirm-deletion",
  "/account/confirm-deletion(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp3|mp4|ogg|wav)).*)",
    "/(api|trpc)(.*)",
  ],
};
