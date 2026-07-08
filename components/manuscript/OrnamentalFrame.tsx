import { cn } from "@/lib/utils";

export function OrnamentalFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative border border-secondary p-[2px]",
        "before:absolute before:inset-1 before:border before:border-primary/60 before:pointer-events-none",
        className
      )}
    >
      {children}
    </div>
  );
}
