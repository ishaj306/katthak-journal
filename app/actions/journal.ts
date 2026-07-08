"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import {
  journalInputSchema,
  type JournalInput,
} from "@/lib/db/types";

export type JournalFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof JournalInput, string>>;
};

function rawFromForm(formData: FormData): Record<string, unknown> {
  return {
    entry_date: formData.get("entry_date"),
    title: formData.get("title") || null,
    body: formData.get("body") || null,
    is_private: formData.get("is_private"),
  };
}

export async function createJournalEntry(
  _prev: JournalFormState,
  formData: FormData
): Promise<JournalFormState> {
  const parsed = journalInputSchema.safeParse(rawFromForm(formData));
  if (!parsed.success) {
    const fieldErrors: JournalFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof JournalInput;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the fields below", fieldErrors };
  }

  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ ...parsed.data, user_id: userId })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/journal");
  redirect(`/journal/${data.id}`);
}

export async function updateJournalEntry(
  id: string,
  _prev: JournalFormState,
  formData: FormData
): Promise<JournalFormState> {
  const parsed = journalInputSchema.safeParse(rawFromForm(formData));
  if (!parsed.success) {
    return { error: "Please fix the fields below" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("journal_entries")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/journal");
  revalidatePath(`/journal/${id}`);
  return {};
}

export async function deleteJournalEntry(id: string) {
  const supabase = await createClient();
  await supabase.from("journal_entries").delete().eq("id", id);
  revalidatePath("/journal");
  redirect("/journal");
}
