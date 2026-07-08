"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { manualSessionSchema } from "@/lib/db/types";

export type RiyazFormState = { error?: string };

const initialState: RiyazFormState = {};

async function getUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  const supabase = await createClient();
  return { supabase, userId };
}

export async function startRiyaz(): Promise<RiyazFormState> {
  const { supabase, userId } = await getUser();
  const { error } = await supabase
    .from("riyaz_sessions")
    .insert({ user_id: userId, started_at: new Date().toISOString() });
  if (error && !/duplicate key/i.test(error.message)) {
    return { error: error.message };
  }
  revalidatePath("/riyaz");
  revalidatePath("/ghungroo");
  return initialState;
}

export async function stopRiyaz(notes: string): Promise<RiyazFormState> {
  const { supabase, userId } = await getUser();
  const { data: open } = await supabase
    .from("riyaz_sessions")
    .select("id")
    .eq("user_id", userId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (!open) return { error: "No active session" };

  const { error } = await supabase
    .from("riyaz_sessions")
    .update({
      ended_at: new Date().toISOString(),
      notes: notes.trim() || null,
    })
    .eq("id", open.id);

  if (error) return { error: error.message };
  revalidatePath("/riyaz");
  revalidatePath("/ghungroo");
  return initialState;
}

export async function cancelRiyaz(): Promise<RiyazFormState> {
  const { supabase, userId } = await getUser();
  const { data: open } = await supabase
    .from("riyaz_sessions")
    .select("id")
    .eq("user_id", userId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (!open) return initialState;

  const { error } = await supabase
    .from("riyaz_sessions")
    .delete()
    .eq("id", open.id);
  if (error) return { error: error.message };
  revalidatePath("/riyaz");
  return initialState;
}

export async function addManualSession(
  _prev: RiyazFormState,
  formData: FormData
): Promise<RiyazFormState> {
  const parsed = manualSessionSchema.safeParse({
    started_at: formData.get("started_at"),
    duration_minutes: formData.get("duration_minutes"),
    notes: formData.get("notes") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await getUser();
  // Stored as ISO; assume input is "YYYY-MM-DDTHH:MM" local time
  const startedLocal = new Date(parsed.data.started_at);
  if (isNaN(startedLocal.getTime())) {
    return { error: "Invalid start time" };
  }
  const endedAt = new Date(
    startedLocal.getTime() + parsed.data.duration_seconds * 1000
  );

  const { error } = await supabase.from("riyaz_sessions").insert({
    user_id: userId,
    started_at: startedLocal.toISOString(),
    ended_at: endedAt.toISOString(),
    notes: parsed.data.notes ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath("/riyaz");
  revalidatePath("/ghungroo");
  return initialState;
}

export async function deleteSession(id: string): Promise<void> {
  const { supabase } = await getUser();
  await supabase.from("riyaz_sessions").delete().eq("id", id);
  revalidatePath("/riyaz");
  revalidatePath("/ghungroo");
}
