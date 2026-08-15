import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Everything is private by default — this is one dancer's personal manuscript.
 * Only the landing page, the Clerk auth screens and the PWA manifest are open,
 * so a page added under app/(app) later is protected without a second edit.
 * (An earlier allow-list missed /costumes and /lineage, which rendered the app
 * chrome around an empty body for signed-out visitors.)
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/manifest.webmanifest",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});

export const config = {
  matcher: [
    // Run middleware on every request except Next internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|ico)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
