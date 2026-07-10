"use client";

import { useState } from "react";
import { Icon } from "@/components/manuscript/Icons";

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
            style={{ color: active ? "#7e570d" : "#dac0c1" }}
          >
            <Icon.Ghungroo size={24} strokeWidth={active ? 1.7 : 1.2} />
          </button>
        );
      })}
    </div>
  );
}
