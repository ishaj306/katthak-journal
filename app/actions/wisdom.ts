"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import {
  wisdomInputSchema,
  type WisdomInput,
} from "@/lib/db/types";

export type WisdomFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof WisdomInput, string>>;
};

function rawFromForm(formData: FormData): Record<string, unknown> {
  return {
    quote: formData.get("quote"),
    attribution: formData.get("attribution") || null,
    category: formData.get("category") || "advice",
    tags: formData.get("tags") || null,
    captured_at: formData.get("captured_at") || null,
    pinned: formData.get("pinned"),
  };
}

export async function createWisdom(
  _prev: WisdomFormState,
  formData: FormData
): Promise<WisdomFormState> {
  const parsed = wisdomInputSchema.safeParse(rawFromForm(formData));
  if (!parsed.success) {
    const fieldErrors: WisdomFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof WisdomInput;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the fields below", fieldErrors };
  }

  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("guru_wisdom")
    .insert({ ...parsed.data, user_id: userId });
  if (error) return { error: error.message };

  revalidatePath("/wisdom");
  return {};
}

export async function updateWisdom(
  id: string,
  _prev: WisdomFormState,
  formData: FormData
): Promise<WisdomFormState> {
  const parsed = wisdomInputSchema.safeParse(rawFromForm(formData));
  if (!parsed.success) {
    return { error: "Please fix the fields below" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("guru_wisdom")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/wisdom");
  return {};
}

export async function deleteWisdom(id: string) {
  const supabase = await createClient();
  await supabase.from("guru_wisdom").delete().eq("id", id);
  revalidatePath("/wisdom");
}

export async function togglePin(id: string, pinned: boolean) {
  const supabase = await createClient();
  await supabase.from("guru_wisdom").update({ pinned }).eq("id", id);
  revalidatePath("/wisdom");
}
