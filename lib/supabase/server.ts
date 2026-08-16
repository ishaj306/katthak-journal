import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Server-side Supabase client that uses Clerk's session JWT as the access
 * token. Supabase's Third-Party Auth verifies the Clerk JWT and RLS policies
 * that read `auth.jwt() ->> 'sub'` see the Clerk user id.
 *
 * Uses `@supabase/supabase-js` directly (not `@supabase/ssr`) because the SSR
 * wrapper is designed around Supabase's own cookie-based auth and can't be
 * combined with the accessToken option.
 */
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => {
        try {
          const { getToken } = await auth();
          return (await getToken()) ?? null;
        } catch {
          // No request scope (e.g. build-time static analysis): `auth()` bails
          // with a dynamic-usage error. This eager call is only supabase-js
          // setting its initial Realtime auth token, which we don't use, so a
          // null token here is harmless and keeps the build log clean. Real
          // requests always have a scope and return the Clerk token normally.
          return null;
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
