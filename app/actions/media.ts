"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function deleteMedia(mediaId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");

  const supabase = await createClient();

  // Look up storage path and composition for revalidation
  const { data: row } = await supabase
    .from("composition_media")
    .select("storage_path, composition_id")
    .eq("id", mediaId)
    .maybeSingle<{ storage_path: string; composition_id: string }>();

  if (!row) return;

  await supabase.storage.from("composition-media").remove([row.storage_path]);
  await supabase.from("composition_media").delete().eq("id", mediaId);

  revalidatePath(`/compositions/${row.composition_id}`);
  revalidatePath("/archive");
}
