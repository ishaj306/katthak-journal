import Link from "next/link";
import { ManuscriptBreak } from "./ManuscriptBreak";
import { brand } from "@/lib/brand";

const links = [
  { label: "The Folios", href: "/#folios" },
  { label: "Your Privacy", href: "/#privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export function SiteFooter() {
  return (
    <footer className="flex w-full flex-col items-center gap-stack-md border-t-2 border-double border-secondary-container bg-surface-container px-margin-mobile py-section-gap md:px-margin-page">
      <div className="flex flex-col items-center gap-4">
        <div className="font-display text-[24px] tracking-widest text-primary">
          KATHAK JOURNAL
        </div>
        <div className="font-serif text-[16px] italic text-secondary">
          Designed, built & kept with care by {brand.maker}
        </div>
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-serif text-[16px] italic text-on-surface-variant transition-opacity hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <ManuscriptBreak className="w-1/3 opacity-30" />
      <div className="text-center font-serif text-[15px] italic text-on-surface opacity-80">
        © {brand.yearRoman} {brand.maker.toUpperCase()}. ALL RIGHTS RESERVED.
        <br />
        PRESERVING THE SACRED RHYTHM.
      </div>
    </footer>
  );
}
