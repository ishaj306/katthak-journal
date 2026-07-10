"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { costumeInputSchema } from "@/lib/db/types";

export type CostumeFormState = { error?: string; ok?: boolean };

async function getUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  const supabase = await createClient();
  return { supabase, userId };
}

export async function addCostume(
  _prev: CostumeFormState,
  formData: FormData
): Promise<CostumeFormState> {
  const parsed = costumeInputSchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    color: formData.get("color") || null,
    fabric: formData.get("fabric") || null,
    occasion: formData.get("occasion") || null,
    worn_on: formData.get("worn_on") || null,
    notes: formData.get("notes") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await getUser();
  const { error } = await supabase.from("costumes").insert({
    user_id: userId,
    name: parsed.data.name,
    kind: parsed.data.kind,
    color: parsed.data.color ?? null,
    fabric: parsed.data.fabric ?? null,
    occasion: parsed.data.occasion ?? null,
    worn_on: parsed.data.worn_on ?? null,
    notes: parsed.data.notes ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath("/costumes");
  return { ok: true };
}

export async function deleteCostume(id: string): Promise<void> {
  const { supabase } = await getUser();
  await supabase.from("costumes").delete().eq("id", id);
  revalidatePath("/costumes");
}
