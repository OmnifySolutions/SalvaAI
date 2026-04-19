import { clerkMiddleware, publicRoutes } from "@clerk/nextjs/server";

export default clerkMiddleware(
  (auth, req) => {
    // Clerk handles authentication; no custom logic needed
  },
  {
    publicRoutes: [
      "/",
      "/pricing",
      "/how-it-works",
      "/sign-in(.*)",
      "/sign-up(.*)",
    ],
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
