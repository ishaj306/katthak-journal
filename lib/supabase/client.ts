"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Browser-side Supabase client that always sends Clerk's current session JWT.
 * Use the hook in client components; never instantiate at module scope.
 */
export function useSupabase() {
  const { session } = useSession();
  return useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          async accessToken() {
            return (await session?.getToken()) ?? null;
          },
        }
      ),
    [session]
  );
}
