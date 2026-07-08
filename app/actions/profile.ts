"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { GHARANAS } from "@/lib/db/types";
import { z } from "zod";

const profileSchema = z.object({
  display_name: z.string().trim().max(120).nullable().optional(),
  primary_guru: z.string().trim().max(200).nullable().optional(),
  gharana: z.enum(GHARANAS).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  country: z.string().trim().max(120).nullable().optional(),
  dance_start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  bio: z.string().max(2000).nullable().optional(),
});

export type ProfileFormState = { error?: string };

function raw(formData: FormData): Record<string, unknown> {
  const get = (k: string) => {
    const v = formData.get(k);
    return v === null || v === "" ? null : v;
  };
  // Year-only convenience: a "start_year" field becomes Jan 1 of that year.
  const year = formData.get("start_year");
  const dance_start_date =
    year && /^\d{4}$/.test(String(year)) ? `${year}-01-01` : get("dance_start_date");
  return {
    display_name: get("display_name"),
    primary_guru: get("primary_guru"),
    gharana: get("gharana"),
    city: get("city"),
    country: get("country"),
    dance_start_date,
    bio: get("bio"),
  };
}

export async function completeOnboarding(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse(raw(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...parsed.data, onboarded: true });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse(raw(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...parsed.data });
  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return {};
}
