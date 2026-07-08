import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/compositions(.*)",
  "/archive(.*)",
  "/riyaz(.*)",
  "/ghungroo(.*)",
  "/performances(.*)",
  "/wisdom(.*)",
  "/journal(.*)",
  "/timeline(.*)",
  "/quotes(.*)",
  "/profile(.*)",
  "/search(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
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
