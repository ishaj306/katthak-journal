"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

/** Removes a Riyaaz capture — its stored audio and its row. */
export async function deleteRiyazRecording(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("riyaz_recordings")
    .select("storage_path, composition_id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle<{ storage_path: string; composition_id: string | null }>();

  if (!row) return;

  const { error: rmErr } = await supabase.storage
    .from("composition-media")
    .remove([row.storage_path]);
  if (rmErr) throw new Error(rmErr.message);
  await supabase
    .from("riyaz_recordings")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (row.composition_id) {
    revalidatePath(`/compositions/${row.composition_id}`);
  }
}

/** Adds or updates a note on a capture (the "add notes later" step). */
export async function updateRiyazRecordingNotes(id: string, notes: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("riyaz_recordings")
    .select("composition_id")
    .eq("id", id)
    .maybeSingle<{ composition_id: string | null }>();

  const { error } = await supabase
    .from("riyaz_recordings")
    .update({ notes: notes.trim() || null })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);

  if (row?.composition_id) {
    revalidatePath(`/compositions/${row.composition_id}`);
  }
}
