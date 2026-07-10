import { localDateKey } from "@/lib/riyaz";
import { Icon } from "@/components/manuscript/Icons";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Presence, not a streak. We witness the days practised rather than punishing
 * the ones missed — a streak counter shames the dancer who rests, travels, or
 * grieves. No "broken" state exists here; only accumulated presence.
 */
export function StreakCard({
  buckets,
  now,
}: {
  buckets: Map<string, number>;
  streak?: number;
  now: Date;
}) {
  const cells = [] as { label: string; active: boolean }[];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const seconds = buckets.get(localDateKey(d)) ?? 0;
    cells.push({ label: DAY_LABELS[d.getDay()], active: seconds > 0 });
  }
  const present = cells.filter((c) => c.active).length;

  return (
    <div
      className="relative border border-secondary bg-surface p-2"
      style={{ padding: "8px" }}
    >
      <div
        className="pointer-events-none absolute"
        style={{ top: "4px", left: "4px", right: "4px", bottom: "4px", border: "2px solid #4e0616" }}
        aria-hidden
      />
      <div className="relative p-6">
        <h3 className="mb-6 text-center font-serif text-label-lg uppercase tracking-widest text-secondary">
          This Week&rsquo;s Presence
        </h3>
        <div className="flex flex-wrap justify-center gap-3 px-2">
          {cells.map((c, i) => (
            <div
              key={i}
              className={`flex flex-col items-center ${c.active ? "text-secondary" : "text-outline opacity-40"}`}
            >
              <Icon.Ghungroo size={26} strokeWidth={c.active ? 1.6 : 1.1} />
              <span className="mt-1 font-serif text-[10px] uppercase opacity-70">
                {c.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <span className="font-display text-5xl text-primary">{present}</span>
          <p className="font-serif text-label-md uppercase tracking-tighter text-on-surface-variant">
            {present === 1 ? "day held this week" : "days held this week"}
          </p>
          <p className="mt-3 font-serif text-body-md italic text-on-surface-variant">
            {present === 0
              ? "Rest is part of the practice. Begin again when you are ready."
              : present === 7
                ? "Every day this week is held in the manuscript."
                : "The manuscript keeps what you give it — no more, no less."}
          </p>
        </div>
      </div>
    </div>
  );
}
