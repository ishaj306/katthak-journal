import Link from "next/link";
import { LayakariCalculator } from "../_components/LayakariCalculator";

export const metadata = {
  title: "Layakari Calculator | Kathak Journal",
};

export default function LayakariPage() {
  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-12 md:px-margin-page">
      <Link
        href="/riyaz"
        className="font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:text-primary"
      >
        ← Riyaz
      </Link>
      <header className="mb-12 mt-6 text-center">
        <p className="font-deva text-headline-md text-secondary">लयकारी</p>
        <h1 className="mt-2 font-display text-display-lg-mobile text-primary md:text-display-lg">
          Layakari Calculator
        </h1>
        <p className="mt-4 font-serif text-body-lg italic text-on-surface-variant">
          How a phrase breathes across the speeds — thaah to athgun.
        </p>
      </header>
      <LayakariCalculator />
    </main>
  );
}
