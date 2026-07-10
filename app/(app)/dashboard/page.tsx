import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/profile";
import { ManuscriptBreak } from "@/components/manuscript/ManuscriptBreak";
import { OrnamentalFrame } from "@/components/manuscript/OrnamentalFrame";
import { Shamsa } from "@/components/manuscript/Ornaments";
import { Reveal, RevealItem } from "@/components/manuscript/Reveal";
import { DailySeal } from "@/components/manuscript/DailySeal";
import { FolioDate } from "@/components/manuscript/FolioDate";
import { Lamplight } from "@/components/manuscript/Lamplight";
import { Icon } from "@/components/manuscript/Icons";
import { pickQuoteOfDay } from "@/lib/lineage";
import {
  COMPOSITION_TYPE_LABELS,
  type KathakQuote,
  type Composition,
  type JournalEntry,
  type GuruWisdom,
} from "@/lib/db/types";

export const metadata = {
  title: "The Daily Folio | Kathak Journal",
};

const doors = [
  {
    key: "learn",
    deva: "ज्ञान",
    title: "Learn",
    body: "Compositions, bols, and the theory of the art.",
    href: "/compositions",
    Icon: Icon.Scroll,
  },
  {
    key: "practice",
    deva: "रियाज़",
    title: "Practice",
    body: "The vigil, the tala, the discipline of devotion.",
    href: "/riyaz",
    Icon: Icon.Ghungroo,
  },
  {
    key: "remember",
    deva: "स्मृति",
    title: "Remember",
    body: "Journal, teachings, performances, and your journey.",
    href: "/journal",
    Icon: Icon.Lotus,
  },
];

const secondary = [
  { label: "Archive", href: "/archive" },
  { label: "Performances", href: "/performances" },
  { label: "Teachings", href: "/wisdom" },
  { label: "Journey", href: "/timeline" },
  { label: "Lineage", href: "/lineage" },
  { label: "Wardrobe", href: "/costumes" },
  { label: "Quotes", href: "/quotes" },
  { label: "Ghungroo", href: "/ghungroo" },
];

function resurfaceMemory(entries: JournalEntry[]): JournalEntry | null {
  if (entries.length === 0) return null;
  const now = new Date();
  const md = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const onThisDay = entries.find(
    (e) =>
      e.entry_date.slice(5) === md &&
      Number(e.entry_date.slice(0, 4)) < now.getFullYear()
  );
  if (onThisDay) return onThisDay;
  // Otherwise, the oldest entry — a memory to revisit.
  return entries[entries.length - 1] ?? null;
}

function excerpt(html: string | null, max = 220): string {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

export default async function DailyFolioPage() {
  let displayName: string | null = null;
  let quoteOfDay: KathakQuote | null = null;
  let inProgress: Composition | null = null;
  let recentSessionIso: string[] = [];
  let practiceDays = 0;
  let memory: JournalEntry | null = null;
  let teaching: GuruWisdom | null = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { userId } = await auth();
    if (userId) {
      const supabase = await createClient();
      const [profile, quotesRes, compRes, sessionsRes, journalRes, wisdomRes] =
        await Promise.all([
          getOrCreateProfile(userId),
          supabase.from("kathak_quotes").select("*"),
          supabase
            .from("compositions")
            .select("id, title, type, guru_name, updated_at")
            .order("updated_at", { ascending: false })
            .limit(1),
          supabase
            .from("riyaz_sessions")
            .select("started_at")
            .order("started_at", { ascending: false })
            .limit(400),
          supabase
            .from("journal_entries")
            .select("id, entry_date, title, body, user_id, is_private, created_at, updated_at")
            .order("entry_date", { ascending: false })
            .limit(400),
          supabase
            .from("guru_wisdom")
            .select("*")
            .order("pinned", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(1),
        ]);

      if (profile && !profile.onboarded) redirect("/onboarding");
      displayName = profile?.display_name ?? null;

      quoteOfDay = pickQuoteOfDay((quotesRes.data ?? []) as KathakQuote[]);
      inProgress = (compRes.data?.[0] as Composition | undefined) ?? null;

      const sessions = (sessionsRes.data ?? []) as { started_at: string }[];
      recentSessionIso = sessions.slice(0, 5).map((s) => s.started_at);
      practiceDays = new Set(
        sessions.map((s) => new Date(s.started_at).toDateString())
      ).size;

      memory = resurfaceMemory((journalRes.data ?? []) as JournalEntry[]);
      teaching = (wisdomRes.data?.[0] as GuruWisdom | undefined) ?? null;
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-margin-mobile py-section-gap md:px-margin-page">
      <Lamplight />
      <Reveal>
        {/* Masthead */}
        <RevealItem>
          <header className="relative text-center">
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-secondary opacity-[0.05]">
              <Shamsa size={320} />
            </div>
            <p className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
              The Daily Folio
            </p>
            <div className="mt-4">
              <FolioDate />
            </div>
            <h1 className="mt-6 font-display text-display-lg-mobile text-primary md:text-display-lg">
              Namaste, {displayName || "dancer"}
            </h1>
            {practiceDays > 0 ? (
              <p className="mt-3 font-serif text-body-md italic text-on-surface-variant">
                The manuscript has held{" "}
                <span className="not-italic text-secondary">{practiceDays}</span>{" "}
                {practiceDays === 1 ? "day" : "days"} of your practice.
              </p>
            ) : (
              <p className="mt-3 font-serif text-body-md italic text-on-surface-variant">
                The manuscript opens fresh. Begin whenever you are ready.
              </p>
            )}
          </header>
        </RevealItem>

        <ManuscriptBreak />

        {/* Quote of the day */}
        {quoteOfDay ? (
          <RevealItem>
            <section className="mx-auto mb-section-gap max-w-3xl">
              <div className="relative bg-surface p-2" style={{ border: "1px solid #7e570d" }}>
                <div
                  className="pointer-events-none absolute"
                  style={{ top: 4, left: 4, right: 4, bottom: 4, border: "0.5px solid #4e0616" }}
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
                </div>
              </div>
            </section>
          </RevealItem>
        ) : null}

        {/* The vigil + what you were learning */}
        <RevealItem>
          <section className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-stretch">
            <div className="flex flex-col items-center justify-center border border-outline-variant bg-surface-container-lowest p-8">
              <p className="mb-6 font-display text-headline-md text-primary">
                Today&rsquo;s Vigil
              </p>
              <DailySeal recentSessionIso={recentSessionIso} />
            </div>

            <div className="flex flex-col justify-center border border-outline-variant bg-surface-container-lowest p-8">
              {inProgress ? (
                <>
                  <p className="mb-2 flex items-center gap-2 font-serif text-label-md uppercase tracking-widest text-secondary">
                    <Icon.Scroll size={16} /> You were learning
                  </p>
                  <h2 className="font-display text-headline-lg text-primary">
                    {inProgress.title}
                  </h2>
                  <p className="mt-2 font-serif text-body-md italic text-on-surface-variant">
                    {COMPOSITION_TYPE_LABELS[inProgress.type]}
                    {inProgress.guru_name ? ` · taught by ${inProgress.guru_name}` : ""}
                  </p>
                  <Link
                    href={`/compositions/${inProgress.id}`}
                    className="mt-6 inline-block self-start border border-primary px-6 py-2 font-serif text-label-md uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-on-primary"
                  >
                    Return to it →
                  </Link>
                </>
              ) : (
                <>
                  <p className="mb-2 flex items-center gap-2 font-serif text-label-md uppercase tracking-widest text-secondary">
                    <Icon.Quill size={16} /> Your first folio
                  </p>
                  <h2 className="font-display text-headline-lg text-primary">
                    Inscribe a composition
                  </h2>
                  <p className="mt-2 font-serif text-body-md italic text-on-surface-variant">
                    Every bol, every correction, every memory begins with the first line.
                  </p>
                  <Link
                    href="/compositions/new"
                    className="mt-6 inline-block self-start border border-primary px-6 py-2 font-serif text-label-md uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-on-primary"
                  >
                    Begin →
                  </Link>
                </>
              )}
            </div>
          </section>
        </RevealItem>

        {/* On this day — the whisper */}
        {memory ? (
          <RevealItem>
            <section className="mx-auto mt-section-gap max-w-3xl text-center">
              <p className="font-serif text-label-md uppercase tracking-[0.25em] text-secondary">
                On this day · {memory.entry_date.slice(0, 4)}
              </p>
              <Link href={`/journal/${memory.id}`} className="group mt-4 block">
                {memory.title ? (
                  <h3 className="font-display text-headline-md italic text-primary transition-colors group-hover:text-secondary">
                    {memory.title}
                  </h3>
                ) : null}
                <p className="mt-3 font-serif text-body-lg italic leading-relaxed text-on-surface-variant opacity-90">
                  &ldquo;{excerpt(memory.body)}&rdquo;
                </p>
              </Link>
            </section>
          </RevealItem>
        ) : null}

        {/* Teaching of the week */}
        {teaching ? (
          <RevealItem>
            <section className="mx-auto mt-section-gap max-w-3xl border-l-2 border-secondary pl-6">
              <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
                {teaching.pinned ? "A teaching you keep close" : "A recent teaching"}
              </p>
              <blockquote className="mt-3 font-display text-headline-md italic leading-snug text-primary">
                &ldquo;{teaching.quote}&rdquo;
              </blockquote>
              {teaching.attribution ? (
                <p className="mt-3 font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
                  — {teaching.attribution}
                </p>
              ) : null}
            </section>
          </RevealItem>
        ) : null}

        {/* The three doors */}
        <RevealItem>
          <section className="mt-section-gap">
            <ManuscriptBreak />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {doors.map((d) => (
                <Link key={d.key} href={d.href}>
                  <OrnamentalFrame className="h-full bg-surface-container-low transition-colors">
                    <div className="flex flex-col items-center p-8 text-center">
                      <span className="text-secondary">
                        <d.Icon size={40} />
                      </span>
                      <p className="mt-3 font-deva text-headline-md text-secondary">
                        {d.deva}
                      </p>
                      <h3 className="mt-1 font-display text-headline-md text-primary">
                        {d.title}
                      </h3>
                      <p className="mt-2 font-serif text-body-md leading-relaxed text-on-surface-variant">
                        {d.body}
                      </p>
                    </div>
                  </OrnamentalFrame>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {secondary.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </section>
        </RevealItem>
      </Reveal>
    </main>
  );
}
