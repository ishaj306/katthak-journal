import { formatHours, type RiyazStats } from "@/lib/riyaz";

export function StatsRow({ stats }: { stats: RiyazStats }) {
  const items = [
    { label: "This Week", value: formatHours(stats.week) },
    { label: "This Month", value: formatHours(stats.month) },
    { label: "Annual", value: formatHours(stats.year) },
    { label: "Lifetime", value: formatHours(stats.lifetime) },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="relative border border-secondary bg-surface p-1"
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
          <div className="relative p-4 text-center">
            <p className="font-serif text-label-md uppercase tracking-widest text-secondary opacity-70">
              {it.label}
            </p>
            <p className="mt-1 font-display text-headline-md text-primary">
              {it.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
