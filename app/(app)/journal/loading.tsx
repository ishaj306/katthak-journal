import {
  PageHeaderSkeleton,
  Skeleton,
} from "@/components/manuscript/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-12 md:px-margin-page">
      <PageHeaderSkeleton />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-outline-variant bg-surface p-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-3 h-6 w-2/3" />
            <Skeleton className="mt-3 h-4 w-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
