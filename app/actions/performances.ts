"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import {
  performanceInputSchema,
  type PerformanceInput,
} from "@/lib/db/types";

export type PerformanceFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof PerformanceInput, string>>;
};

function rawFromForm(formData: FormData): Record<string, unknown> {
  const get = (k: string) => {
    const v = formData.get(k);
    return v === null || v === "" ? null : v;
  };
  return {
    event_name: get("event_name"),
    venue: get("venue"),
    performed_on: get("performed_on"),
    type: get("type"),
    costume_notes: get("costume_notes"),
    makeup_notes: get("makeup_notes"),
    prep_notes: get("prep_notes"),
    rehearsal_notes: get("rehearsal_notes"),
    costume_id: get("costume_id"),
    reflection_well: get("reflection_well"),
    reflection_mistakes: get("reflection_mistakes"),
    reflection_learned: get("reflection_learned"),
    reflection_improve: get("reflection_improve"),
  };
}

export async function createPerformance(
  _prev: PerformanceFormState,
  formData: FormData
): Promise<PerformanceFormState> {
  const parsed = performanceInputSchema.safeParse(rawFromForm(formData));
  if (!parsed.success) {
    const fieldErrors: PerformanceFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof PerformanceInput;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the fields below", fieldErrors };
  }

  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("performances")
    .insert({ ...parsed.data, user_id: userId })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/performances");
  redirect(`/performances/${data.id}`);
}

export async function updatePerformance(
  id: string,
  _prev: PerformanceFormState,
  formData: FormData
): Promise<PerformanceFormState> {
  const parsed = performanceInputSchema.safeParse(rawFromForm(formData));
  if (!parsed.success) {
    const fieldErrors: PerformanceFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof PerformanceInput;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the fields below", fieldErrors };
  }

  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("performances")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: error.message };

  revalidatePath("/performances");
  revalidatePath(`/performances/${id}`);
  return {};
}

export async function deletePerformance(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");

  const supabase = await createClient();

  // Clear Storage before the cascade drops performance_media rows.
  const { data: mediaRows } = await supabase
    .from("performance_media")
    .select("storage_path")
    .eq("performance_id", id);
  const paths = ((mediaRows ?? []) as { storage_path: string }[]).map(
    (m) => m.storage_path
  );
  if (paths.length > 0) {
    await supabase.storage.from("performance-media").remove(paths);
  }

  const { error } = await supabase
    .from("performances")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/performances");
  redirect("/performances");
}

export async function deletePerformanceMedia(mediaId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("performance_media")
    .select("storage_path, performance_id")
    .eq("id", mediaId)
    .eq("user_id", userId)
    .maybeSingle<{ storage_path: string; performance_id: string }>();
  if (!row) return;

  const { error: rmErr } = await supabase.storage
    .from("performance-media")
    .remove([row.storage_path]);
  // Only drop the row once the object is gone, so a failed removal doesn't
  // leave an orphaned file with no record pointing at it.
  if (rmErr) throw new Error(rmErr.message);
  await supabase
    .from("performance_media")
    .delete()
    .eq("id", mediaId)
    .eq("user_id", userId);

  revalidatePath(`/performances/${row.performance_id}`);
}

// ---- compositions being performed ----------------------------------------

export async function addPerformanceComposition(
  performanceId: string,
  compositionId: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  if (!compositionId) return;

  const supabase = await createClient();
  const { error } = await supabase.from("performance_compositions").insert({
    performance_id: performanceId,
    composition_id: compositionId,
    user_id: userId,
  });
  // A duplicate simply means it's already on the programme — not an error.
  if (error && !/duplicate key/i.test(error.message)) {
    throw new Error(error.message);
  }
  revalidatePath(`/performances/${performanceId}`);
}

export async function removePerformanceComposition(
  id: string,
  performanceId: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  const supabase = await createClient();
  const { error } = await supabase
    .from("performance_compositions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath(`/performances/${performanceId}`);
}
