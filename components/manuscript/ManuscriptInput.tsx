import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface ManuscriptInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const ManuscriptInput = forwardRef<
  HTMLInputElement,
  ManuscriptInputProps
>(function ManuscriptInput({ label, id, className, ...rest }, ref) {
  const inputId = id ?? rest.name;
  return (
    <div className="relative">
      <label
        htmlFor={inputId}
        className="mb-1 block font-serif text-[12px] font-medium uppercase tracking-widest text-secondary"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        {...rest}
        className={cn(
          "w-full border-0 border-b border-secondary/40 bg-transparent py-3 px-0",
          "font-serif text-[16px] text-on-surface placeholder:italic placeholder:text-on-surface-variant/40",
          "transition-colors duration-300 focus:border-primary focus:outline-none focus:ring-0",
          className
        )}
      />
    </div>
  );
});
