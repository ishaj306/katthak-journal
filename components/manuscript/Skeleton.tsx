import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[linear-gradient(90deg,#ece8de,#f1eee4,#ece8de)] bg-[length:200%_100%]",
        className
      )}
      aria-hidden
    />
  );
}

/** A grid of manuscript-card skeletons for list pages. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-outline-variant bg-surface-container-lowest p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="mb-4 h-7 w-3/4" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-6 h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Centered page header skeleton. */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-16 flex flex-col items-center">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="mt-6 h-5 w-96 max-w-full" />
    </div>
  );
}
