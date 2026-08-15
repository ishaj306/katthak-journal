"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import type { LoopMode, PersistedMixItem } from "@/lib/riyaz-queue";

export type SaveMixResult = { error?: string };

/** Saves the current sequence as a named mix (new, or overwriting by id). */
export async function saveMix(input: {
  id?: string;
  name: string;
  defaultGap: number;
  loop: LoopMode;
  items: PersistedMixItem[];
}): Promise<SaveMixResult> {
  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };

  const name = input.name.trim();
  if (!name) return { error: "Give the mix a name" };
  if (input.items.length === 0) return { error: "The mix is empty" };

  const supabase = await createClient();
  const row = {
    user_id: userId,
    name: name.slice(0, 120),
    default_gap: Math.max(0, Math.min(600, Math.round(input.defaultGap))),
    loop: input.loop,
    items: input.items,
  };

  const { error } = input.id
    ? await supabase.from("riyaz_mixes").update(row).eq("id", input.id)
    : await supabase.from("riyaz_mixes").insert(row);

  if (error) return { error: error.message };

  revalidatePath("/riyaz/sequence");
  return {};
}

export async function deleteMix(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  const supabase = await createClient();
  const { error } = await supabase
    .from("riyaz_mixes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/riyaz/sequence");
}
