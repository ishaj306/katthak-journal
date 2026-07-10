import { cn } from "@/lib/utils";
import { Icon } from "./Icons";

export function GhungrooDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center gap-4 my-8", className)}
      role="separator"
      aria-hidden
    >
      <span className="h-px flex-1 bg-[linear-gradient(to_right,transparent,#B8893E,transparent)]" />
      <span className="text-secondary">
        <Icon.Ghungroo size={22} strokeWidth={1.5} />
      </span>
      <span className="h-px flex-1 bg-[linear-gradient(to_right,transparent,#B8893E,transparent)]" />
    </div>
  );
}
