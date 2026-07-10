"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./Icons";
import { HOME, NAV_GROUPS, FOOTER_NAV, activeHref } from "./navConfig";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const active = activeHref(pathname);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const itemCls = (href: string) =>
    `flex items-center gap-4 px-6 py-3 font-serif text-body-md transition-colors ${
      active === href
        ? "border-l-4 border-primary bg-secondary-fixed/20 text-primary"
        : "text-on-surface-variant hover:bg-secondary-fixed/10 hover:text-primary"
    }`;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 text-primary"
        aria-label="Open menu"
      >
        <Icon.Menu size={24} />
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
                <Icon.Close size={22} />
              </button>
            </div>

            <div className="py-2">
              <Link href={HOME.href} className={itemCls(HOME.href)}>
                <span className="flex-none text-secondary">
                  <HOME.Icon size={20} />
                </span>
                {HOME.label}
              </Link>

              {NAV_GROUPS.map((group) => (
                <div key={group.key} className="mt-4">
                  <p className="flex items-baseline gap-2 px-6 pb-1 font-serif text-label-md uppercase tracking-[0.2em] text-secondary">
                    <span className="font-deva text-body-md normal-case tracking-normal">
                      {group.deva}
                    </span>
                    {group.label}
                  </p>
                  {group.items.map((item) => (
                    <Link key={item.href} href={item.href} className={itemCls(item.href)}>
                      <span className="flex-none text-secondary">
                        <item.Icon size={20} />
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}

              <div className="mt-4 border-t border-outline-variant pt-2">
                {FOOTER_NAV.map((item) => (
                  <Link key={item.href} href={item.href} className={itemCls(item.href)}>
                    <span className="flex-none text-secondary">
                      <item.Icon size={20} />
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
