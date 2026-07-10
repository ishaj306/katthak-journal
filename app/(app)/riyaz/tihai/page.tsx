import Link from "next/link";
import { TihaiBuilder } from "../_components/TihaiBuilder";

export const metadata = {
  title: "Tihai Builder | Kathak Journal",
};

export default function TihaiPage() {
  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-12 md:px-margin-page">
      <Link
        href="/riyaz"
        className="font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:text-primary"
      >
        ← Riyaz
      </Link>
      <header className="mb-12 mt-6 text-center">
        <p className="font-deva text-headline-md text-secondary">तिहाई</p>
        <h1 className="mt-2 font-display text-display-lg-mobile text-primary md:text-display-lg">
          Tihai Builder
        </h1>
        <p className="mt-4 font-serif text-body-lg italic text-on-surface-variant">
          A phrase spoken thrice, resolving on sam. Find the rest that lands it.
        </p>
      </header>
      <TihaiBuilder />
    </main>
  );
}
