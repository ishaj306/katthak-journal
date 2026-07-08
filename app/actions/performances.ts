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

  const supabase = await createClient();
  const { error } = await supabase
    .from("performances")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/performances");
  revalidatePath(`/performances/${id}`);
  return {};
}

export async function deletePerformance(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("performances").delete().eq("id", id);
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
    .maybeSingle<{ storage_path: string; performance_id: string }>();
  if (!row) return;

  await supabase.storage.from("performance-media").remove([row.storage_path]);
  await supabase.from("performance_media").delete().eq("id", mediaId);

  revalidatePath(`/performances/${row.performance_id}`);
}
