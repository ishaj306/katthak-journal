import {
  PageHeaderSkeleton,
  CardGridSkeleton,
} from "@/components/manuscript/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-12 md:px-margin-page">
      <PageHeaderSkeleton />
      <div className="mb-12 h-px w-full bg-outline-variant" />
      <CardGridSkeleton count={4} />
    </main>
  );
}
