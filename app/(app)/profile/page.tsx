import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/profile";
import { formatBytes } from "@/lib/media-config";
import { GHARANA_LABELS } from "@/lib/db/types";
import { GhungrooMandala } from "@/components/manuscript/Ornaments";
import { ProfileForm } from "./ProfileForm";

export const metadata = {
  title: "Profile | Kathak Journal",
};

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [profile, user] = await Promise.all([
    getOrCreateProfile(userId),
    currentUser(),
  ]);
  if (!profile) redirect("/onboarding");

  const supabase = await createClient();

  // Storage used across both media tables
  const [{ data: cm }, { data: pm }, { count: compCount }] = await Promise.all([
    supabase.from("composition_media").select("file_size"),
    supabase.from("performance_media").select("file_size"),
    supabase.from("compositions").select("id", { count: "exact", head: true }),
  ]);
  const bytes =
    [...(cm ?? []), ...(pm ?? [])].reduce(
      (acc, r) => acc + ((r as { file_size: number | null }).file_size ?? 0),
      0
    ) || 0;
  const QUOTA = 1024 * 1024 * 1024; // 1 GB soft reference
  const pct = Math.min(100, (bytes / QUOTA) * 100);

  const startYear = profile.dance_start_date
    ? new Date(profile.dance_start_date).getFullYear()
    : null;

  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-12 md:px-margin-page">
      <header className="mb-12 flex flex-col items-center text-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-secondary bg-surface">
          <GhungrooMandala className="text-secondary" size={90} />
        </div>
        <h1 className="mt-6 font-display text-display-lg-mobile text-primary">
          {profile.display_name || "Dancer"}
        </h1>
        <p className="mt-2 font-serif text-body-md italic text-on-surface-variant">
          {[
            startYear ? `Dancer since ${startYear}` : null,
            profile.gharana ? GHARANA_LABELS[profile.gharana] : null,
            profile.primary_guru ? `Guru ${profile.primary_guru}` : null,
          ]
            .filter(Boolean)
            .join("  ·  ") || "Your journey awaits its first mark"}
        </p>
      </header>

      <section className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border border-outline-variant bg-surface-container-low p-6 text-center">
          <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
            Compositions
          </p>
          <p className="mt-1 font-display text-headline-md text-primary">
            {compCount ?? 0}
          </p>
        </div>
        <div className="border border-outline-variant bg-surface-container-low p-6 text-center md:col-span-2">
          <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
            Cloud Archive
          </p>
          <p className="mt-1 font-serif text-body-md text-primary">
            {formatBytes(bytes)} preserved
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden border border-secondary bg-surface">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </section>

      <div className="relative border border-secondary bg-surface p-[2px]">
        <div
          className="pointer-events-none absolute"
          style={{
            top: "4px",
            left: "4px",
            right: "4px",
            bottom: "4px",
            border: "1px solid #4e0616",
          }}
          aria-hidden
        />
        <div className="relative p-7 md:p-10">
          <h2 className="mb-8 font-display text-headline-md text-primary">
            Edit your details
          </h2>
          <ProfileForm profile={profile} />
        </div>
      </div>

      <p className="mt-8 text-center font-serif text-label-md italic text-on-surface-variant">
        Signed in as {user?.emailAddresses[0]?.emailAddress ?? "—"}. Manage
        your login and password from the avatar menu.
      </p>
    </main>
  );
}
