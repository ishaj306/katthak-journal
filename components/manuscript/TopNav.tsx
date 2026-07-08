import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const links = [
  { label: "The Archive", href: "/#archive", active: true },
  { label: "Lineages", href: "/#lineages" },
  { label: "Philosophy", href: "/#philosophy" },
  { label: "Journal", href: "/#journal" },
  { label: "Folios", href: "/#folios" },
];

export function TopNav() {
  return (
    <nav className="fixed top-0 z-50 flex w-full max-w-full items-center justify-between border-b border-primary/20 bg-background/80 px-margin-mobile py-6 backdrop-blur-sm md:px-margin-page">
      <Link
        href="/"
        className="cursor-default font-display text-[28px] leading-none tracking-tighter text-primary md:text-display-lg"
      >
        Kathak Journal
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={
              link.active
                ? "border-b border-secondary font-serif text-[14px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-secondary"
                : "font-serif text-[14px] font-medium uppercase tracking-widest text-on-surface-variant transition-colors hover:text-secondary"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>

      <SignedOut>
        <Link
          href="/sign-in"
          className="border border-primary px-6 py-2 font-serif text-[14px] font-semibold uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-on-primary"
        >
          Enter Court
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          href="/dashboard"
          className="border border-primary px-6 py-2 font-serif text-[14px] font-semibold uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-on-primary"
        >
          Open Folio
        </Link>
      </SignedIn>
    </nav>
  );
}
