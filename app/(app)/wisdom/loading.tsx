import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/manuscript/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-margin-mobile py-12 md:px-margin-page">
      <PageHeaderSkeleton />
      <CardGridSkeleton />
    </main>
  );
}
