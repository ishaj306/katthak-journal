import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Everything is private by default — this is one dancer's personal manuscript.
 * Only the landing page, the Terms / Privacy folios, the Clerk auth screens
 * and the PWA manifest are open,
 * so a page added under app/(app) later is protected without a second edit.
 * (An earlier allow-list missed /costumes and /lineage, which rendered the app
 * chrome around an empty body for signed-out visitors.)
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy",
  "/terms",
  "/manifest.webmanifest",
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (!isPublicRoute(req)) {
      const { userId, redirectToSignIn } = await auth();
      if (!userId) {
        return redirectToSignIn({ returnBackUrl: req.url });
      }
    }
  },
  {
    // Only accept session tokens minted for this app's own origin (blocks
    // tokens replayed from another site). Set NEXT_PUBLIC_APP_ORIGIN in Vercel.
    authorizedParties: [
      process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000",
    ],
  }
);

export const config = {
  matcher: [
    // Run middleware on every request except Next internals, static files,
    // and crawler/well-known files (robots.txt, sitemap.xml, /.well-known/*)
    "/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|\\.well-known/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|ico)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
