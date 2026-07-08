import { cn } from "@/lib/utils";

export function ManuscriptBreak({
  className,
  motif = "⬥",
}: {
  className?: string;
  motif?: string;
}) {
  return (
    <div
      className={cn(
        "relative my-8 h-px w-full",
        "bg-[linear-gradient(90deg,transparent,#7e570d_50%,transparent)]",
        className
      )}
      role="separator"
      aria-hidden
    >
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-[1.2rem] text-secondary">
        {motif}
      </span>
    </div>
  );
}
