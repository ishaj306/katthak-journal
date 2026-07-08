import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/db/types";

/**
 * Reads the current user's profile, creating a blank one on first call.
 * Returns null only if there is no signed-in user id.
 */
export async function getOrCreateProfile(
  userId: string
): Promise<Profile | null> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<Profile>();

  if (existing) return existing;

  const { data: created } = await supabase
    .from("profiles")
    .insert({ id: userId })
    .select("*")
    .maybeSingle<Profile>();

  return created ?? null;
}
