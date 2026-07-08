import Link from "next/link";
import { ManuscriptBreak } from "./ManuscriptBreak";

const links = [
  { label: "Archives", href: "/#archives" },
  { label: "The Lineage", href: "/about" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export function SiteFooter() {
  return (
    <footer className="flex w-full flex-col items-center gap-stack-md border-t-2 border-double border-secondary-container bg-surface-container px-margin-mobile py-section-gap md:px-margin-page">
      <div className="flex flex-col items-center gap-4">
        <div className="font-display text-[24px] tracking-widest text-primary">
          KATHAK JOURNAL
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-serif text-[16px] italic text-on-surface-variant transition-opacity hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <ManuscriptBreak className="w-1/3 opacity-30" />
      <div className="font-serif text-[16px] italic text-on-surface opacity-80">
        © MMXXIV KATHAK JOURNAL. PRESERVING THE SACRED RHYTHM.
      </div>
    </footer>
  );
}
