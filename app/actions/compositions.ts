"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import {
  compositionInputSchema,
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("compositions")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/compositions");
  revalidatePath(`/compositions/${id}`);
  return {};
}

export async function deleteComposition(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("compositions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/compositions");
  redirect("/compositions");
}
