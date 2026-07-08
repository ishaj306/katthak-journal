import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { MobileNav } from "./MobileNav";

const links = [
  { label: "Compositions", href: "/compositions" },
  { label: "Stage", href: "/performances" },
  { label: "Wisdom", href: "/wisdom" },
  { label: "Journal", href: "/journal" },
  { label: "Riyaz", href: "/riyaz" },
  { label: "Archive", href: "/archive" },
  { label: "Journey", href: "/timeline" },
  { label: "Quotes", href: "/quotes" },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-between gap-4 border-b border-outline-variant bg-surface px-margin-mobile py-4 md:px-margin-page">
      <Link
        href="/dashboard"
        className="font-display text-headline-md uppercase tracking-widest text-primary md:text-headline-lg"
      >
        Kathak Journal
      </Link>

      <nav className="hidden flex-wrap items-center gap-6 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Link
          href="/search"
          className="p-2 text-primary transition-colors hover:bg-surface-container-high"
          aria-label="Search"
          title="Search"
        >
          <span className="material-symbols-outlined align-middle">search</span>
        </Link>
        <Link
          href="/ghungroo"
          className="hidden p-2 text-primary transition-colors hover:bg-surface-container-high sm:block"
          aria-label="Ghungroo Hours"
          title="Ghungroo Hours"
        >
          <span
            className="material-symbols-outlined align-middle"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            notifications_active
          </span>
        </Link>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: "h-9 w-9",
              userButtonPopoverCard:
                "border border-secondary bg-surface rounded-none",
            },
          }}
        />
        <MobileNav />
      </div>
    </header>
  );
}
