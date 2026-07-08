import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/profile";
import { ManuscriptBreak } from "@/components/manuscript/ManuscriptBreak";
import { OrnamentalFrame } from "@/components/manuscript/OrnamentalFrame";
import { pickQuoteOfDay } from "@/lib/lineage";
import type { KathakQuote } from "@/lib/db/types";

export const metadata = {
  title: "Folio | Kathak Journal",
};

const tiles = [
  {
    href: "/compositions",
    icon: "auto_stories",
    title: "Compositions",
    body: "Document Vandanas, Tukdas, Chakradars, and every bol in your repertoire.",
    ready: true,
  },
  {
    href: "/archive",
    icon: "inventory_2",
    title: "Memory Vault",
    body: "Audio, video, images — every recording preserved across all your compositions.",
    ready: true,
  },
  {
    href: "/riyaz",
    icon: "history_toggle_off",
    title: "Riyaz Tracker",
    body: "Mark each day of practice and watch the heatmap fill in gold.",
    ready: true,
  },
  {
    href: "/ghungroo",
    icon: "notifications_active",
    title: "Ghungroo Hours",
    body: "Watch your lifetime practice hours earn the weight of each sacred bell.",
    ready: true,
  },
  {
    href: "/performances",
    icon: "theater_comedy",
    title: "Stage Journal",
    body: "Archive every performance with photos, videos, and reflections.",
    ready: true,
  },
  {
    href: "/wisdom",
    icon: "format_quote",
    title: "Guru Wisdom",
    body: "Preserve the corrections and teachings your gurus pass down.",
    ready: true,
  },
  {
    href: "/journal",
    icon: "menu_book",
    title: "Private Pages",
    body: "Your personal journal — riyaz reflections, emotions, discoveries.",
    ready: true,
  },
  {
    href: "/timeline",
    icon: "timeline",
    title: "Your Journey",
    body: "The chronological tapestry of compositions, performances, and wisdom.",
    ready: true,
  },
  {
    href: "/quotes",
    icon: "format_quote",
    title: "Words of the Masters",
    body: "A curated library of dance wisdom across the ages.",
    ready: true,
  },
];

export default async function DashboardPage() {
  let email: string | undefined;
  let displayName: string | null = null;
  let compositionCount: number | null = null;

  let lifetimeSeconds = 0;
  let quoteOfDay: KathakQuote | null = null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;
    email = user?.emailAddresses[0]?.emailAddress;

    if (userId) {
      const profile = await getOrCreateProfile(userId);
      if (profile && !profile.onboarded) redirect("/onboarding");
      displayName = profile?.display_name ?? null;

      const supabase = await createClient();
      const { count } = await supabase
        .from("compositions")
        .select("id", { count: "exact", head: true });
      compositionCount = count ?? 0;

      const { data: durations } = await supabase
        .from("riyaz_sessions")
        .select("duration_seconds")
        .not("duration_seconds", "is", null);
      lifetimeSeconds = (durations ?? []).reduce(
        (acc, r) => acc + ((r as { duration_seconds: number | null }).duration_seconds ?? 0),
        0
      );

      const { data: quotes } = await supabase.from("kathak_quotes").select("*");
      quoteOfDay = pickQuoteOfDay((quotes ?? []) as KathakQuote[]);
    }
  }
  const lifetimeHours = Math.floor(lifetimeSeconds / 3600);

  return (
    <main className="mx-auto max-w-6xl px-margin-mobile py-section-gap md:px-margin-page">
      <header className="text-center">
        <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
          Folio I
        </p>
        <h1 className="mt-2 font-display text-display-lg-mobile text-primary md:text-display-lg">
          Namaste, {displayName || "dancer"}
        </h1>
        <p className="mt-3 font-serif text-body-lg italic text-on-surface-variant">
          {email ? `Signed in as ${email}` : "The manuscript opens fresh."}
        </p>
        {compositionCount !== null ? (
          <p className="mt-2 font-serif text-body-md italic text-on-surface-variant opacity-80">
            {compositionCount} {compositionCount === 1 ? "composition" : "compositions"}
            {" · "}
            {lifetimeHours} ghungroo {lifetimeHours === 1 ? "hour" : "hours"}
          </p>
        ) : null}
      </header>

      <ManuscriptBreak />

      {quoteOfDay ? (
        <section className="mx-auto mb-section-gap max-w-3xl">
          <div
            className="relative bg-surface p-2"
            style={{ border: "1px solid #7e570d" }}
          >
            <div
              className="pointer-events-none absolute"
              style={{
                top: "4px",
                left: "4px",
                right: "4px",
                bottom: "4px",
                border: "0.5px solid #4e0616",
              }}
              aria-hidden
            />
            <div className="relative p-8 text-center md:p-10">
              <p className="mb-4 font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
                Today&rsquo;s wisdom
              </p>
              <blockquote
                className="font-display italic leading-snug text-primary"
                style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
              >
                &ldquo;{quoteOfDay.quote}&rdquo;
              </blockquote>
              <p className="mt-4 font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
                — {quoteOfDay.attribution}
                {quoteOfDay.source ? `, ${quoteOfDay.source}` : ""}
              </p>
              <Link
                href="/quotes"
                className="mt-6 inline-block font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:text-primary"
              >
                Visit the library →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {tiles.map((tile) => {
          const inner = (
            <OrnamentalFrame
              className={`bg-surface-container-low transition-transform duration-500 ${
                tile.ready ? "hover:-translate-y-1" : "opacity-70"
              }`}
            >
              <div className="flex flex-col items-center p-8 text-center">
                <span className="material-symbols-outlined mb-4 text-5xl text-secondary">
                  {tile.icon}
                </span>
                <h3 className="mb-3 font-display text-headline-md text-primary">
                  {tile.title}
                </h3>
                <p className="font-serif text-body-md leading-relaxed text-on-surface-variant">
                  {tile.body}
                </p>
                <p className="mt-6 font-serif text-label-md uppercase tracking-widest text-secondary">
                  {tile.ready ? "Open" : "Coming in a later phase"}
                </p>
              </div>
            </OrnamentalFrame>
          );
          return tile.ready ? (
            <Link key={tile.href} href={tile.href}>
              {inner}
            </Link>
          ) : (
            <div key={tile.href}>{inner}</div>
          );
        })}
      </div>
    </main>
  );
}
