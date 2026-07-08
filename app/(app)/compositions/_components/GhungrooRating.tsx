"use client";

import { useState } from "react";

export function GhungrooRating({
  name = "difficulty",
  defaultValue = 0,
}: {
  name?: string;
  defaultValue?: number;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Difficulty">
      <input type="hidden" name={name} value={value || ""} />
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => setValue(n === value ? 0 : n)}
            className="cursor-pointer transition-colors"
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{
                color: active ? "#7e570d" : "#dac0c1",
                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              notifications
            </span>
          </button>
        );
      })}
    </div>
  );
}
