import { buildHeatmap, HEATMAP_COLORS, formatHours } from "@/lib/riyaz";

export function Heatmap({
  buckets,
  now,
}: {
  buckets: Map<string, number>;
  now: Date;
}) {
  const grid = buildHeatmap(buckets, now, 53);

  return (
    <section className="mb-section-gap">
      <h2 className="mb-8 text-center font-serif text-label-lg uppercase tracking-[0.3em] text-secondary">
        The Arc of Constancy
      </h2>
      <div
        className="relative border border-secondary bg-surface-container-low p-2"
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
        <div className="relative overflow-x-auto p-6">
          <div className="min-w-[760px]">
            <div
              className="grid gap-[3px]"
              style={{
                gridTemplateColumns: `repeat(${grid.length}, 1fr)`,
              }}
            >
              {grid.map((col, ci) => (
                <div key={ci} className="grid grid-rows-7 gap-[3px]">
                  {col.map((cell, ri) => (
                    <div
                      key={ri}
                      className="aspect-square w-full"
                      style={{
                        backgroundColor: cell.inFuture
                          ? "transparent"
                          : HEATMAP_COLORS[cell.intensity],
                        opacity: cell.inFuture ? 0 : 1,
                      }}
                      title={
                        cell.inFuture
                          ? ""
                          : `${cell.date} — ${cell.seconds === 0 ? "no riyaz" : formatHours(cell.seconds)}`
                      }
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between font-serif text-[11px] uppercase tracking-widest text-on-surface-variant/70">
              <span>52 weeks past</span>
              <div className="flex items-center gap-2">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="inline-block h-3 w-3"
                    style={{
                      backgroundColor:
                        HEATMAP_COLORS[i as 0 | 1 | 2 | 3 | 4],
                    }}
                  />
                ))}
                <span>More</span>
              </div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
