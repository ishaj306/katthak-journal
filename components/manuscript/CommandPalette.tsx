"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icons";
import { HOME, NAV_GROUPS, FOOTER_NAV } from "./navConfig";

const NAV_ITEMS = [
  HOME,
  ...NAV_GROUPS.flatMap((g) => g.items),
  ...FOOTER_NAV,
];

type Row = { label: string; href: string; Icon: typeof Icon.Book; hint?: string };

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl-K toggles; Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("kj:open-command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("kj:open-command", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      // focus after paint
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    const nav: Row[] = NAV_ITEMS.filter((i) =>
      q ? i.label.toLowerCase().includes(q) : true
    ).map((i) => ({ label: i.label, href: i.href, Icon: i.Icon, hint: "Go" }));

    if (q) {
      nav.push({
        label: `Search everything for “${query.trim()}”`,
        href: `/search?q=${encodeURIComponent(query.trim())}`,
        Icon: Icon.Search,
        hint: "Search",
      });
    }
    return nav;
  }, [query]);

  const go = (row: Row | undefined) => {
    if (!row) return;
    setOpen(false);
    router.push(row.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(rows[index]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-inverse-surface/40" aria-hidden />
      <div
        className="relative w-full max-w-xl bg-surface p-2"
        style={{ border: "1px solid #7e570d" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute"
          style={{ top: 4, left: 4, right: 4, bottom: 4, border: "0.5px solid #4e0616" }}
          aria-hidden
        />
        <div className="relative">
          <div className="flex items-center gap-3 border-b border-outline-variant px-5 py-4">
            <span className="text-secondary">
              <Icon.Search size={20} />
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Jump to a folio, or search the manuscript…"
              className="w-full bg-transparent font-serif text-body-lg text-primary placeholder:text-outline-variant focus:outline-none"
            />
          </div>

          <ul className="max-h-[50vh] overflow-y-auto py-2">
            {rows.length === 0 ? (
              <li className="px-5 py-4 font-serif text-body-md italic text-on-surface-variant">
                Nothing by that name.
              </li>
            ) : (
              rows.map((row, i) => (
                <li key={row.href}>
                  <button
                    type="button"
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => go(row)}
                    className={`flex w-full items-center gap-3 px-5 py-2.5 text-left font-serif text-body-md transition-colors ${
                      i === index
                        ? "bg-tertiary-fixed/40 text-primary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    <span className="flex-none text-secondary">
                      <row.Icon size={18} />
                    </span>
                    <span className="flex-1 truncate">{row.label}</span>
                    <span className="flex-none font-serif text-label-md uppercase tracking-widest text-outline">
                      {row.hint}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>

          <div className="flex items-center justify-between border-t border-outline-variant px-5 py-2 font-serif text-label-md text-on-surface-variant">
            <span>↑↓ to move · ↵ to open</span>
            <span className="uppercase tracking-widest">⌘K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
