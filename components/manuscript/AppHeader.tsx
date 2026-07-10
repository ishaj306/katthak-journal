import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { MobileNav } from "./MobileNav";
import { Icon } from "./Icons";

/**
 * Mobile-only top bar. On desktop the left spine (AppSpine) carries navigation,
 * so this is hidden there.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-between gap-4 border-b border-outline-variant bg-surface px-margin-mobile py-4 md:hidden">
      <Link
        href="/dashboard"
        className="font-display text-headline-md uppercase tracking-widest text-primary"
      >
        Kathak Journal
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/search"
          className="p-2 text-primary transition-colors hover:bg-surface-container-high"
          aria-label="Search"
          title="Search"
        >
          <Icon.Search size={22} />
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
