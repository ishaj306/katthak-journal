import { CompositionForm } from "../_components/CompositionForm";
import { Icon } from "@/components/manuscript/Icons";

export const metadata = {
  title: "Add to Manuscript | Kathak Journal",
};

export default function NewCompositionPage() {
  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-section-gap md:px-margin-page">
      <header className="relative mb-16 text-center">
        <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-secondary opacity-20">
          <Icon.Book size={96} />
        </div>
        <h1 className="font-display text-display-lg-mobile text-primary md:text-display-lg">
          Add to your manuscript
        </h1>
        <p className="mt-4 font-serif text-body-md italic text-on-surface-variant">
          Chronicle the rhythms of your journey into the sacred scrolls.
        </p>
      </header>

      <div
        className="relative border border-secondary bg-surface p-8 shadow-sm md:p-12"
        style={{ padding: "1px" }}
      >
        <div
          className="pointer-events-none absolute"
          style={{
            top: "4px",
            left: "4px",
            right: "4px",
            bottom: "4px",
            border: "1px solid #4e0616",
          }}
          aria-hidden
        />
        <div className="relative p-7 md:p-11">
          <CompositionForm />
        </div>
      </div>
    </main>
  );
}
