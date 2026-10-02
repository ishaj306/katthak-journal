import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * True when `id` in `table` belongs to `userId`. Server actions call this
 * before linking one record to another, so a crafted request can't attach
 * someone else's composition / performance / costume. Migration 0016 enforces
 * the same rule in the database for every write path; this gives a clean
 * error message and holds even where that migration isn't applied yet.
 */
export async function ownsRow(
  supabase: SupabaseClient,
  table: "compositions" | "performances" | "costumes",
  id: string | null | undefined,
  userId: string
): Promise<boolean> {
  if (!id) return true;
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return !error && data !== null;
}
