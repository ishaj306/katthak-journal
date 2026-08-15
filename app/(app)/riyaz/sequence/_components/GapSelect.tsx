"use client";

import { useState } from "react";
import { GAP_PRESETS } from "@/lib/riyaz-queue";

/**
 * Chooses a breathing gap in seconds. `value` of null means "use the mix
 * default" (only offered when `allowDefault`). A Custom option reveals a small
 * number field so any gap the presets don't cover is still reachable.
 */
export function GapSelect({
  value,
  onChange,
  allowDefault = false,
  compact = false,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  allowDefault?: boolean;
  compact?: boolean;
}) {
  const isPreset =
    value === null || (value != null && GAP_PRESETS.includes(value as never));
  const [custom, setCustom] = useState(!isPreset);

  const selectValue = custom
    ? "custom"
    : value === null
      ? "default"
      : String(value);

  const cls = compact
    ? "border-0 border-b border-outline-variant bg-transparent py-0.5 font-serif text-label-md text-primary focus:outline-none"
    : "border-0 border-b border-primary bg-transparent py-1 font-serif text-body-md text-primary focus:outline-none";

  return (
    <span className="inline-flex items-center gap-2">
      <select
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "custom") {
            setCustom(true);
            onChange(value ?? 10);
            return;
          }
          setCustom(false);
          onChange(v === "default" ? null : Number(v));
        }}
        className={cls}
        aria-label="Gap in seconds"
      >
        {allowDefault ? <option value="default">Default</option> : null}
        {GAP_PRESETS.map((g) => (
          <option key={g} value={g}>
            {g === 0 ? "No gap" : `${g}s`}
          </option>
        ))}
        <option value="custom">Custom…</option>
      </select>
      {custom ? (
        <input
          type="number"
          min={0}
          max={600}
          value={value ?? 0}
          onChange={(e) =>
            onChange(Math.max(0, Math.min(600, Number(e.target.value))))
          }
          className="w-16 border-0 border-b border-primary bg-transparent py-0.5 font-serif text-body-md tabular-nums text-primary focus:outline-none"
          aria-label="Custom gap seconds"
        />
      ) : null}
    </span>
  );
}
