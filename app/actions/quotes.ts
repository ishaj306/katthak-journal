"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function toggleQuoteFavorite(
  quoteId: string,
  currentlyFavorite: boolean
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");

  const supabase = await createClient();
  if (currentlyFavorite) {
    await supabase
      .from("quote_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("quote_id", quoteId);
  } else {
    await supabase
      .from("quote_favorites")
      .insert({ user_id: userId, quote_id: quoteId });
  }

  revalidatePath("/quotes");
  revalidatePath("/dashboard");
}
