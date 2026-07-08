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
        const { getToken } = await auth();
        return (await getToken()) ?? null;
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
