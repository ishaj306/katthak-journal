import { localDateKey } from "@/lib/riyaz";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function StreakCard({
  buckets,
  streak,
  now,
}: {
  buckets: Map<string, number>;
  streak: number;
  now: Date;
}) {
  // Show last 7 days, today rightmost
  const cells = [] as { label: string; active: boolean }[];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const seconds = buckets.get(localDateKey(d)) ?? 0;
    cells.push({
      label: DAY_LABELS[d.getDay()],
      active: seconds > 0,
    });
  }

  return (
    <div
      className="relative border border-secondary bg-surface p-2"
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
      <div className="relative p-6">
        <h3 className="mb-6 text-center font-serif text-label-lg uppercase tracking-widest text-secondary">
          Devotion Streak
        </h3>
        <div className="flex flex-wrap justify-center gap-3 px-2">
          {cells.map((c, i) => (
            <div
              key={i}
              className={`flex flex-col items-center ${c.active ? "" : "opacity-30"}`}
            >
              <span
                className="material-symbols-outlined text-3xl text-secondary"
                style={{ fontVariationSettings: c.active ? "'FILL' 1" : "'FILL' 0" }}
              >
                notifications
              </span>
              <span className="mt-1 font-serif text-[10px] uppercase opacity-60">
                {c.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <span className="font-display text-5xl text-primary">{streak}</span>
          <p className="font-serif text-label-md uppercase tracking-tighter text-on-surface-variant">
            Consecutive Sunrises
          </p>
        </div>
      </div>
    </div>
  );
}
