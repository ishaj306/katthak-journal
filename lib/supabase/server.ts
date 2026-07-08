import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Server-side Supabase client that uses Clerk's session JWT as the access
 * token. Make sure Clerk is configured as a Third-Party Auth provider in your
 * Supabase project so RLS policies that read `auth.jwt() ->> 'sub'` see the
 * Clerk user id.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { getToken } = await auth();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — middleware will refresh.
          }
        },
      },
      async accessToken() {
        return (await getToken()) ?? null;
      },
    }
  );
}
