"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Icon } from "./Icons";
import { HOME, NAV_GROUPS, FOOTER_NAV, activeHref } from "./navConfig";

export function AppSpine() {
  const pathname = usePathname();
  const active = activeHref(pathname);

  const itemCls = (href: string) =>
    `flex items-center gap-3 px-3 py-2 font-serif text-body-md transition-colors ${
      active === href
        ? "border-l-2 border-secondary bg-tertiary-fixed/30 text-primary"
        : "border-l-2 border-transparent text-on-surface-variant hover:border-outline-variant hover:text-primary"
    }`;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-none flex-col border-r border-outline-variant bg-surface md:flex">
      <Link
        href="/dashboard"
        className="block border-b border-outline-variant px-5 py-5 font-display text-headline-md uppercase tracking-widest text-primary"
      >
        Kathak Journal
      </Link>

      <div className="px-3 pt-4">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("kj:open-command"))}
          className="flex w-full items-center gap-3 border border-outline-variant px-3 py-2 font-serif text-body-md text-on-surface-variant transition-colors hover:border-secondary hover:text-primary"
        >
          <Icon.Search size={17} />
          <span className="flex-1 text-left">Search…</span>
          <span className="font-serif text-label-md uppercase tracking-widest text-outline">
            ⌘K
          </span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <Link href={HOME.href} className={itemCls(HOME.href)}>
          <HOME.Icon size={18} />
          {HOME.label}
        </Link>

        {NAV_GROUPS.map((group) => (
          <div key={group.key} className="mt-6">
            <p className="mb-1 flex items-baseline gap-2 px-3 font-serif text-label-md uppercase tracking-[0.2em] text-secondary">
              <span className="font-deva text-body-md normal-case tracking-normal">
                {group.deva}
              </span>
              {group.label}
            </p>
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} className={itemCls(item.href)}>
                <span className="flex-none text-secondary">
                  <item.Icon size={17} />
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-outline-variant px-4 py-3">
        <div className="flex gap-1">
          {FOOTER_NAV.filter((item) => item.href !== "/search").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 transition-colors ${
                active === item.href
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              aria-label={item.label}
              title={item.label}
            >
              <item.Icon size={20} />
            </Link>
          ))}
        </div>
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
      </div>
    </aside>
  );
}
