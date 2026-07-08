"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "filled" | "outline";

export interface MaroonButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  trailingIcon?: string;
}

export const MaroonButton = forwardRef<HTMLButtonElement, MaroonButtonProps>(
  function MaroonButton(
    { className, variant = "filled", trailingIcon, children, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        {...rest}
        className={cn(
          "group inline-flex items-center justify-center gap-3 px-10 py-4 transition-all duration-300",
          "font-serif text-[14px] font-semibold uppercase tracking-[0.2em]",
          variant === "filled" &&
            "bg-primary text-on-primary hover:bg-primary-container",
          variant === "outline" &&
            "border border-secondary text-secondary hover:bg-secondary-fixed/10",
          className
        )}
      >
        <span>{children}</span>
        {trailingIcon ? (
          <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:translate-x-2">
            {trailingIcon}
          </span>
        ) : null}
      </button>
    );
  }
);
