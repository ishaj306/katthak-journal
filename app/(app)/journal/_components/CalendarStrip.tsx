import Link from "next/link";
import { lastNDates, todayIso } from "@/lib/memory";

export function CalendarStrip({
  entryDates,
}: {
  entryDates: Set<string>;
}) {
  const today = todayIso();
  const dates = lastNDates(14, new Date());

  return (
    <div className="flex justify-center gap-1 overflow-x-auto px-2 py-4 md:gap-3">
      {dates.map((iso) => {
        const d = new Date(iso);
        const has = entryDates.has(iso);
        const isToday = iso === today;
        const day = d.toLocaleDateString(undefined, { weekday: "short" });
        const dayNum = d.getDate();
        return (
          <Link
            key={iso}
            href={`/journal?d=${iso}`}
            className={`flex min-w-[3rem] flex-col items-center border p-2 transition-colors ${
              isToday
                ? "border-primary bg-primary text-on-primary"
                : has
                  ? "border-secondary bg-surface text-primary hover:bg-secondary-fixed/30"
                  : "border-outline-variant bg-surface text-on-surface-variant hover:border-secondary"
            }`}
          >
            <span className="font-serif text-[10px] uppercase tracking-widest">
              {day}
            </span>
            <span className="font-display text-headline-md">{dayNum}</span>
            {has ? (
              <span
                className="mt-1 inline-block h-1 w-1 rounded-full"
                style={{
                  background: isToday ? "currentColor" : "#B8893E",
                }}
              />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
