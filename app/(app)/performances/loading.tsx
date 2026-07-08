import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/manuscript/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-margin-mobile py-12 md:px-margin-page">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={4} />
    </main>
  );
}
