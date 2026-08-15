import { createClient } from "@/lib/supabase/server";
import type { RiyazSession } from "@/lib/db/types";
import {
  bucketByDay,
  computeStreak,
  computeStats,
} from "@/lib/riyaz";
import { RiyazTimer } from "./_components/RiyazTimer";
import { StreakCard } from "./_components/StreakCard";
import { StatsRow } from "./_components/StatsRow";
import { Heatmap } from "./_components/Heatmap";
import { ManualSessionForm } from "./_components/ManualSessionForm";
import { SessionList } from "./_components/SessionList";
import { Metronome } from "./_components/Metronome";
import Link from "next/link";
import { Icon } from "@/components/manuscript/Icons";

export const metadata = {
  title: "Riyaz | Kathak Journal",
};

const tools = [
  {
    href: "/riyaz/sequence",
    deva: "क्रम",
    title: "Riyaaz Sequence",
    body: "Build a practice mix from your recordings and talas, with breathing gaps, and let it play hands-free.",
    Icon: Icon.Ghungroo,
  },
  {
    href: "/riyaz/tihai",
    deva: "तिहाई",
    title: "Tihai Builder",
    body: "Find the rest that lands a thrice-spoken phrase on sam.",
    Icon: Icon.Ghungroo,
  },
  {
    href: "/riyaz/layakari",
    deva: "लयकारी",
    title: "Layakari Calculator",
    body: "See how a phrase breathes across the speeds, thaah to athgun.",
    Icon: Icon.Tabla,
  },
];

export default async function RiyazPage() {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("riyaz_sessions")
    .select("*")
    .order("started_at", { ascending: false });

  const sessions = (rows ?? []) as RiyazSession[];
  const open = sessions.find((s) => !s.ended_at) ?? null;
  const buckets = bucketByDay(sessions);
  const now = new Date();
  const streak = computeStreak(buckets, now);
  const stats = computeStats(sessions, now);

  return (
    <main className="mx-auto max-w-7xl px-margin-mobile py-12 md:px-margin-page">
      <header className="mb-12 text-center">
        <h1 className="mb-2 font-display text-display-lg-mobile text-primary md:text-display-lg">
          Riyaz — The discipline of devotion
        </h1>
        <p className="font-serif text-body-lg italic text-on-surface-variant">
          Refining the soul through the constancy of practice.
        </p>
      </header>

      {error ? (
        <div className="mx-auto mb-12 max-w-xl border border-error/40 bg-error-container p-6 text-center">
          <p className="font-serif text-body-md text-on-error-container">
            {error.message}
          </p>
          <p className="mt-2 font-serif text-label-md italic text-on-error-container">
            If this mentions a missing table, paste{" "}
            <code>supabase/migrations/0002_riyaz.sql</code> into your Supabase
            SQL Editor.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-gutter lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RiyazTimer openSessionStartedAt={open?.started_at ?? null} />
        </div>
        <aside className="flex flex-col gap-8 lg:col-span-4">
          <StreakCard buckets={buckets} streak={streak} now={now} />
          <StatsRow stats={stats} />
        </aside>
      </div>

      <div className="mt-gutter">
        <Metronome />
      </div>

      <section className="mt-section-gap">
        <h2 className="mb-8 text-center font-serif text-label-lg uppercase tracking-[0.3em] text-secondary">
          Practice Tools
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group flex items-start gap-5 border border-outline-variant bg-surface-container-lowest p-6 transition-colors hover:border-secondary"
            >
              <span className="mt-1 flex-none text-secondary">
                <t.Icon size={36} />
              </span>
              <div>
                <p className="font-deva text-body-lg text-secondary">{t.deva}</p>
                <h3 className="mt-0.5 font-display text-headline-md text-primary">
                  {t.title}
                </h3>
                <p className="mt-1 font-serif text-body-md text-on-surface-variant">
                  {t.body}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div
        className="relative my-section-gap h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #4e0616 50%, transparent)",
        }}
      >
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-secondary"
          style={{ fontSize: "1.2rem" }}
        >
          ⬥
        </span>
      </div>

      <Heatmap buckets={buckets} now={now} />

      <section className="mb-section-gap">
        <h2 className="mb-8 text-center font-serif text-label-lg uppercase tracking-[0.3em] text-secondary">
          Recent Sessions
        </h2>
        <SessionList sessions={sessions} />
      </section>

      <section className="mb-16">
        <ManualSessionForm />
      </section>
    </main>
  );
}
