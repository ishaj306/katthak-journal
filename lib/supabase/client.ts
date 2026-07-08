"use client";

import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Browser-side Supabase client that always sends Clerk's current session JWT.
 * Use the hook inside client components; never instantiate at module scope.
 *
 * Uses `@supabase/supabase-js` directly instead of `@supabase/ssr` — the SSR
 * wrapper's cookie handling conflicts with the accessToken option.
 */
export function useSupabase() {
  const { session } = useSession();
  return useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          accessToken: async () => {
            return (await session?.getToken()) ?? null;
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      ),
    [session]
  );
}
