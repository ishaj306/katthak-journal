import { JournalForm } from "../_components/JournalForm";

export const metadata = {
  title: "New Journal Page | Kathak Journal",
};

export default function NewJournalPage() {
  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-section-gap md:px-margin-page">
      <header className="mb-10 text-center">
        <h1 className="font-display text-display-lg-mobile text-primary md:text-display-lg">
          A fresh page
        </h1>
        <p className="mt-3 font-serif text-body-md italic text-on-surface-variant">
          Write before the day&rsquo;s rhythm forgets you.
        </p>
      </header>
      <div className="relative border border-secondary bg-surface p-[2px] shadow-sm">
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
          <JournalForm />
        </div>
      </div>
    </main>
  );
}
