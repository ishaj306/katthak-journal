import Link from "next/link";
import { TopNav } from "./TopNav";
import { SiteFooter } from "./SiteFooter";
import { ManuscriptBreak } from "./ManuscriptBreak";
import { brand } from "@/lib/brand";

/** Shared frame for the Terms and Privacy folios. */
export function LegalFolio({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-3xl px-margin-mobile pb-section-gap pt-40 md:px-8">
        <header className="text-center">
          <p className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-display-lg-mobile text-primary md:text-display-lg">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-serif text-body-lg italic text-on-surface-variant">
            {intro}
          </p>
          <p className="mt-4 font-serif text-[15px] italic text-secondary">
            Last updated {brand.policiesUpdated}
          </p>
        </header>
        <ManuscriptBreak />
        <article className="space-y-10 font-serif text-body-md leading-relaxed text-on-surface">
          {children}
        </article>
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="font-serif text-[16px] italic text-on-surface-variant hover:text-primary"
          >
            ← Return to the first folio
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-headline-md text-primary">{title}</h2>
      {children}
    </section>
  );
}

export function ContactLine() {
  return brand.contactEmail ? (
    <>
      write to {brand.maker} at{" "}
      <a
        href={`mailto:${brand.contactEmail}`}
        className="text-primary underline decoration-secondary underline-offset-4"
      >
        {brand.contactEmail}
      </a>
    </>
  ) : (
    <>reach out to {brand.maker} directly</>
  );
}
