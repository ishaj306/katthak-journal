"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import {
  saveMixInputSchema,
  type LoopMode,
  type PersistedMixItem,
} from "@/lib/riyaz-queue";

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

  const parsed = saveMixInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid mix" };
  }
  const mix = parsed.data;

  const supabase = await createClient();
  const row = {
    user_id: userId,
    name: mix.name,
    default_gap: Math.round(mix.defaultGap),
    loop: mix.loop,
    items: mix.items,
  };

  const { error } = mix.id
    ? await supabase
        .from("riyaz_mixes")
        .update(row)
        .eq("id", mix.id)
        .eq("user_id", userId)
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
