import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { RiyazSession } from "@/lib/db/types";
import {
  computeStats,
  formatHourCount,
  formatHours,
  MILESTONES,
  milestoneState,
} from "@/lib/riyaz";
import { Icon } from "@/components/manuscript/Icons";

export const metadata = {
  title: "Ghungroo Hours | Kathak Journal",
};

function formatLongDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function GhungrooPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("riyaz_sessions")
    .select("*")
    .order("started_at", { ascending: false });

  const sessions = (rows ?? []) as RiyazSession[];
  const now = new Date();
  const stats = computeStats(sessions, now);
  const { current, next, progressToNext } = milestoneState(stats.lifetime);
  const lifetimeHoursDisplay = formatHourCount(stats.lifetime);

  return (
    <main className="mx-auto max-w-6xl px-margin-mobile py-12 md:px-margin-page">
      <div className="mb-8 flex justify-end">
        <Link
          href="/ghungroo/diary"
          className="border border-outline-variant px-4 py-2 font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:border-secondary hover:text-primary"
        >
          Ghungroo Diary →
        </Link>
      </div>
      <div
        className="relative border border-secondary bg-surface-container-low p-2 shadow-2xl"
        style={{ padding: "8px" }}
      >
        <div
          className="pointer-events-none absolute"
          style={{
            top: "4px",
            left: "4px",
            right: "4px",
            bottom: "4px",
            border: "2px solid #4e0616",
          }}
          aria-hidden
        />
        <div className="relative overflow-hidden p-8 md:p-12">
          <section className="relative z-10 mb-16 text-center">
            <p className="mb-4 font-serif text-label-lg uppercase tracking-[0.2em] text-secondary">
              Sacred Accumulation
            </p>
            <h1
              className="font-display font-bold leading-none text-primary"
              style={{ fontSize: "clamp(4rem, 10vw, 8rem)" }}
            >
              {lifetimeHoursDisplay}
            </h1>
            <p className="-mt-4 font-display text-headline-md italic text-on-surface-variant">
              Ghungroo Hours Manifested
            </p>

            {/* String of bells representing the journey */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 p-8">
              {(() => {
                const idx = current
                  ? MILESTONES.findIndex((m) => m.hours === current.hours)
                  : -1;
                const bells: { state: "achieved" | "current" | "future" }[] = [];
                const start = Math.max(0, idx - 1);
                const end = Math.min(MILESTONES.length, start + 5);
                for (let i = start; i < end; i++) {
                  if (i <= idx) bells.push({ state: "achieved" });
                  else if (i === idx + 1) bells.push({ state: "current" });
                  else bells.push({ state: "future" });
                }
                return bells.map((b, i) => (
                  <div key={i} className="flex items-center gap-4">
                    {i > 0 ? (
                      <div
                        className={`h-[2px] w-12 ${b.state === "future" ? "bg-outline-variant" : "bg-secondary"}`}
                      />
                    ) : null}
                    <div
                      className={`relative ${b.state === "future" ? "opacity-30" : ""}`}
                    >
                      <span
                        className={
                          b.state === "current" ? "text-primary" : "text-secondary"
                        }
                      >
                        <Icon.Ghungroo
                          size={b.state === "current" ? 46 : 38}
                          strokeWidth={1.6}
                        />
                      </span>
                      {b.state === "current" ? (
                        <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-primary" />
                      ) : null}
                    </div>
                  </div>
                ));
              })()}
            </div>

            <p className="mx-auto mt-6 max-w-md font-serif text-label-md text-on-surface-variant">
              Each bell resonates with the discipline of a thousand steps. Your
              journey continues toward the next sacred resonance.
            </p>
          </section>

          <div className="my-16 flex w-full items-center justify-center">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
            <div className="mx-8 rotate-45 border-2 border-secondary p-1">
              <div className="h-2 w-2 bg-primary" />
            </div>
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
          </div>

          <section className="relative">
            <h2 className="mb-16 text-center font-display text-headline-lg text-primary">
              The Path of Revered Milestones
            </h2>

            {next ? (
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
                  Toward {next.label} · {next.hours.toLocaleString()}h
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden border border-secondary bg-surface">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(progressToNext * 100).toFixed(1)}%` }}
                  />
                </div>
                <p className="mt-3 font-serif text-body-md italic text-on-surface-variant">
                  {formatHours(
                    next.hours * 3600 - stats.lifetime,
                    1
                  )}{" "}
                  to the next bell
                </p>
              </div>
            ) : (
              <p className="mb-16 text-center font-serif text-body-lg italic text-primary">
                Every bell has been earned. Continue dancing.
              </p>
            )}

            <div className="relative overflow-x-auto py-12">
              <div className="mx-auto flex min-w-[1100px] items-center justify-between px-4">
                {MILESTONES.map((m, i) => {
                  const achieved = current && current.hours >= m.hours;
                  const isNext = next?.hours === m.hours;
                  const sizeClass = achieved
                    ? "h-28 w-28 md:h-32 md:w-32"
                    : isNext
                      ? "h-32 w-32 md:h-36 md:w-36"
                      : "h-24 w-24 md:h-28 md:w-28";
                  return (
                    <div
                      key={m.hours}
                      className={`flex flex-col items-center ${achieved || isNext ? "" : "opacity-40"}`}
                    >
                      <div
                        className={`relative ${sizeClass} flex items-center justify-center rounded-full border-2 ${
                          achieved
                            ? "border-secondary bg-surface shadow-md"
                            : isNext
                              ? "border-dashed border-secondary bg-surface-container-highest"
                              : "border-outline bg-surface-dim"
                        }`}
                      >
                        <span
                          className={
                            achieved
                              ? "text-primary"
                              : isNext
                                ? "text-secondary"
                                : "text-outline"
                          }
                        >
                          {achieved || isNext ? (
                            <Icon.Ghungroo size={44} strokeWidth={1.6} />
                          ) : (
                            <Icon.Lock size={34} />
                          )}
                        </span>
                        <div
                          className={`absolute -bottom-2 -right-2 px-2 py-1 font-serif text-[10px] font-bold uppercase tracking-widest ${achieved ? "bg-primary text-on-primary" : isNext ? "bg-on-surface-variant text-on-primary" : "bg-outline text-on-primary"}`}
                        >
                          {m.hours.toLocaleString()}h
                        </div>
                        {isNext ? (
                          <div className="absolute inset-0 animate-ping rounded-full border-4 border-primary opacity-20" />
                        ) : null}
                      </div>
                      <p
                        className={`mt-4 font-serif text-label-md ${achieved ? "text-on-surface-variant" : isNext ? "text-secondary" : "text-outline"} ${isNext ? "font-bold" : ""}`}
                        style={{ position: "relative", top: i % 2 ? "0" : "0" }}
                      >
                        {m.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="border border-outline-variant bg-surface-container p-8">
              <p className="mb-2 font-serif text-label-lg uppercase tracking-widest text-secondary">
                Longest Vigil
              </p>
              <div className="font-display text-headline-lg text-primary">
                {formatHours(stats.longestSessionSec, 1)}
              </div>
              <p className="mt-2 font-serif text-body-md italic text-on-surface-variant">
                {formatLongDate(stats.longestSessionDate)}
              </p>
            </div>

            <div className="border border-outline-variant bg-surface-container-high p-8 md:col-span-2">
              <p className="mb-2 font-serif text-label-lg uppercase tracking-widest text-secondary">
                Monthly Devotion
              </p>
              <div className="font-display text-headline-lg text-primary">
                {formatHours(stats.month, 1)} This Moon
              </div>
              <p className="mt-2 font-serif text-body-md italic text-on-surface-variant">
                Year so far: {formatHours(stats.year, 0)}
              </p>
            </div>
          </section>

          <div className="mt-20 text-center">
            <Link
              href="/riyaz"
              className="inline-block border border-primary bg-surface px-12 py-4 font-serif text-label-lg uppercase tracking-[0.2em] text-primary transition-colors duration-300 hover:bg-secondary-fixed"
            >
              Commence New Session
            </Link>
            <p className="mt-6 font-serif text-body-md italic text-on-surface-variant">
              &ldquo;Let the bells speak the language of the ancestors.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
