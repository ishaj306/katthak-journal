import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/manuscript/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-margin-mobile pt-12 md:px-margin-page">
      <PageHeaderSkeleton />
      <div className="mb-12 h-px w-full bg-outline-variant" />
      <CardGridSkeleton />
    </main>
  );
}
