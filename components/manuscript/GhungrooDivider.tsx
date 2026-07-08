import { cn } from "@/lib/utils";

export function GhungrooDivider({
  className,
  icon = "notifications_active",
}: {
  className?: string;
  icon?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center gap-4 my-8", className)}
      role="separator"
      aria-hidden
    >
      <span className="h-px flex-1 bg-[linear-gradient(to_right,transparent,#B8893E,transparent)]" />
      <span
        className="material-symbols-outlined text-secondary"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <span className="h-px flex-1 bg-[linear-gradient(to_right,transparent,#B8893E,transparent)]" />
    </div>
  );
}
