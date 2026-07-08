"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const links = [
  { label: "Folio", href: "/dashboard", icon: "home" },
  { label: "Compositions", href: "/compositions", icon: "auto_stories" },
  { label: "Memory Vault", href: "/archive", icon: "inventory_2" },
  { label: "Riyaz", href: "/riyaz", icon: "history_toggle_off" },
  { label: "Ghungroo Hours", href: "/ghungroo", icon: "notifications_active" },
  { label: "Stage Journal", href: "/performances", icon: "theater_comedy" },
  { label: "Guru Wisdom", href: "/wisdom", icon: "format_quote" },
  { label: "Private Pages", href: "/journal", icon: "menu_book" },
  { label: "Your Journey", href: "/timeline", icon: "timeline" },
  { label: "Quotes", href: "/quotes", icon: "format_quote" },
  { label: "Search", href: "/search", icon: "search" },
  { label: "Profile", href: "/profile", icon: "account_circle" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 text-primary"
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined align-middle">menu</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90]">
          <div
            className="absolute inset-0 bg-inverse-surface/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-l-2 border-double border-primary bg-surface">
            <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
              <span className="font-display text-headline-md uppercase tracking-widest text-primary">
                Folios
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 text-primary"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined align-middle">
                  close
                </span>
              </button>
            </div>
            <div className="flex flex-col py-2">
              {links.map((link) => {
                const active =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-4 px-6 py-3 font-serif text-body-md transition-colors ${
                      active
                        ? "border-l-4 border-primary bg-secondary-fixed/20 font-bold text-primary"
                        : "text-on-surface-variant hover:bg-secondary-fixed/10 hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
