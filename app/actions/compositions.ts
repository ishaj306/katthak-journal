"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import {
  compositionInputSchema,
  examLevelInputSchema,
  type CompositionInput,
} from "@/lib/db/types";

export type CompositionFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof CompositionInput, string>>;
};

function rawFromForm(formData: FormData): Record<string, unknown> {
  const get = (k: string) => {
    const v = formData.get(k);
    return v === null || v === "" ? null : v;
  };
  return {
    title: get("title"),
    type: get("type"),
    gharana: get("gharana"),
    guru_name: get("guru_name"),
    date_learned: get("date_learned"),
    difficulty: get("difficulty"),
    tala_id: get("tala_id"),
    tala_name: get("tala_name"),
    matras: get("matras"),
    lay: get("lay"),
    bols: get("bols"),
    meaning: get("meaning"),
    instructions: get("instructions"),
    corrections: get("corrections"),
  };
}

export async function createComposition(
  _prev: CompositionFormState,
  formData: FormData
): Promise<CompositionFormState> {
  const parsed = compositionInputSchema.safeParse(rawFromForm(formData));
  if (!parsed.success) {
    const fieldErrors: CompositionFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof CompositionInput;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the fields below", fieldErrors };
  }

  const { userId } = await auth();
  if (!userId) return { error: "You must be signed in" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compositions")
    .insert({ ...parsed.data, user_id: userId })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/compositions");
  redirect(`/compositions/${data.id}`);
}

export async function updateComposition(
  id: string,
  _prev: CompositionFormState,
  formData: FormData
): Promise<CompositionFormState> {
  const parsed = compositionInputSchema.safeParse(rawFromForm(formData));
  if (!parsed.success) {
    const fieldErrors: CompositionFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof CompositionInput;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the fields below", fieldErrors };
  }

  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };

  const supabase = await createClient();
  // `user_id` guard is defense-in-depth on top of RLS.
  const { error } = await supabase
    .from("compositions")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: error.message };

  revalidatePath("/compositions");
  revalidatePath(`/compositions/${id}`);
  return {};
}

export async function deleteComposition(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");

  const supabase = await createClient();

  // A DB cascade drops composition_media rows but never touches Storage, so
  // remove the objects first or they orphan (and keep billing).
  const { data: mediaRows } = await supabase
    .from("composition_media")
    .select("storage_path")
    .eq("composition_id", id);
  const paths = ((mediaRows ?? []) as { storage_path: string }[]).map(
    (m) => m.storage_path
  );
  if (paths.length > 0) {
    await supabase.storage.from("composition-media").remove(paths);
  }

  const { error } = await supabase
    .from("compositions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/compositions");
  redirect("/compositions");
}

// ============================================================
// Exam-level context
// ============================================================

export type ExamLevelFormState = { error?: string };

export async function addExamLevel(
  compositionId: string,
  _prev: ExamLevelFormState,
  formData: FormData
): Promise<ExamLevelFormState> {
  const parsed = examLevelInputSchema.safeParse({
    level: formData.get("level"),
    relation: formData.get("relation"),
    noted_on: formData.get("noted_on") || null,
    notes: formData.get("notes") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };

  const supabase = await createClient();
  const { error } = await supabase.from("composition_exam_levels").insert({
    ...parsed.data,
    composition_id: compositionId,
    user_id: userId,
  });
  if (error) return { error: error.message };

  revalidatePath(`/compositions/${compositionId}`);
  return {};
}

export async function deleteExamLevel(id: string, compositionId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  const supabase = await createClient();
  const { error } = await supabase
    .from("composition_exam_levels")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath(`/compositions/${compositionId}`);
}
