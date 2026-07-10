import { Icon } from "./Icons";

type IconFn = typeof Icon.Book;
export type NavItem = { label: string; href: string; Icon: IconFn };
export type NavGroup = {
  key: string;
  deva: string;
  label: string;
  items: NavItem[];
};

export const HOME: NavItem = {
  label: "The Daily Folio",
  href: "/dashboard",
  Icon: Icon.Home,
};

/** The three doors — everything nests beneath one of these intentions. */
export const NAV_GROUPS: NavGroup[] = [
  {
    key: "learn",
    deva: "ज्ञान",
    label: "Learn",
    items: [
      { label: "Compositions", href: "/compositions", Icon: Icon.Book },
      { label: "Memory Vault", href: "/archive", Icon: Icon.Archive },
      { label: "Words of the Masters", href: "/quotes", Icon: Icon.Quote },
    ],
  },
  {
    key: "practice",
    deva: "रियाज़",
    label: "Practice",
    items: [
      { label: "Riyaz", href: "/riyaz", Icon: Icon.Tabla },
      { label: "Ghungroo Hours", href: "/ghungroo", Icon: Icon.Ghungroo },
      { label: "Ghungroo Diary", href: "/ghungroo/diary", Icon: Icon.Ghungroo },
      { label: "Tihai Builder", href: "/riyaz/tihai", Icon: Icon.Lotus },
      { label: "Layakari", href: "/riyaz/layakari", Icon: Icon.Tabla },
    ],
  },
  {
    key: "remember",
    deva: "स्मृति",
    label: "Remember",
    items: [
      { label: "Journal", href: "/journal", Icon: Icon.Quill },
      { label: "Guru Wisdom", href: "/wisdom", Icon: Icon.Quote },
      { label: "Performances", href: "/performances", Icon: Icon.Mask },
      { label: "Journey", href: "/timeline", Icon: Icon.Calendar },
      { label: "Lineage", href: "/lineage", Icon: Icon.Lotus },
      { label: "Wardrobe", href: "/costumes", Icon: Icon.Peacock },
    ],
  },
];

export const FOOTER_NAV: NavItem[] = [
  { label: "Search", href: "/search", Icon: Icon.Search },
  { label: "Profile", href: "/profile", Icon: Icon.User },
];

const ALL_HREFS = [
  HOME.href,
  ...NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href)),
  ...FOOTER_NAV.map((i) => i.href),
];

/**
 * The single nav href that best matches the current path — the longest href
 * that is an exact match or a parent segment. Prevents /riyaz and /riyaz/tihai
 * both highlighting at once.
 */
export function activeHref(pathname: string): string | null {
  let best: string | null = null;
  for (const href of ALL_HREFS) {
    if (pathname === href || pathname.startsWith(href + "/")) {
      if (!best || href.length > best.length) best = href;
    }
  }
  return best;
}
