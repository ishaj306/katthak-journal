"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { ghungrooInputSchema } from "@/lib/db/types";

export type GhungrooFormState = { error?: string; ok?: boolean };

async function getUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  const supabase = await createClient();
  return { supabase, userId };
}

export async function addGhungrooEntry(
  _prev: GhungrooFormState,
  formData: FormData
): Promise<GhungrooFormState> {
  const parsed = ghungrooInputSchema.safeParse({
    entry_date: formData.get("entry_date"),
    kind: formData.get("kind"),
    title: formData.get("title") || null,
    bell_count: formData.get("bell_count") || null,
    string_material: formData.get("string_material") || null,
    notes: formData.get("notes") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await getUser();
  const { error } = await supabase.from("ghungroo_entries").insert({
    user_id: userId,
    entry_date: parsed.data.entry_date,
    kind: parsed.data.kind,
    title: parsed.data.title ?? null,
    bell_count: parsed.data.bell_count ?? null,
    string_material: parsed.data.string_material ?? null,
    notes: parsed.data.notes ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath("/ghungroo/diary");
  return { ok: true };
}

export async function deleteGhungrooEntry(id: string): Promise<void> {
  const { supabase } = await getUser();
  await supabase.from("ghungroo_entries").delete().eq("id", id);
  revalidatePath("/ghungroo/diary");
}
