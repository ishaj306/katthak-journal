/**
 * Bespoke line icons for Kathak Journal — drawn in the subject's own world
 * (ghungroo, diya, lotus, tabla, peacock, quill) to replace Google's generic
 * Material glyphs. Single stroke weight, round caps, inherit `currentColor`.
 *
 * Usage: <Icon.Lotus size={28} className="text-secondary" />
 */

import type { MediaKind } from "@/lib/db/types";

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

function base({ size = 24, className, strokeWidth = 1.25 }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

function Lotus(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 20c-4.2 0-7.5-2.4-7.5-5 2 .3 3.8.1 5.3-.8" />
      <path d="M12 20c4.2 0 7.5-2.4 7.5-5-2 .3-3.8.1-5.3-.8" />
      <path d="M12 20c-2.6-1-4.2-3.4-4-6.4 1.6.9 3 2.3 4 4.2 1-1.9 2.4-3.3 4-4.2.2 3-1.4 5.4-4 6.4Z" />
      <path d="M12 18c0-3 0-6 0-14 1.8 2.4 3 5.4 3 8.5" />
      <path d="M12 4c-1.8 2.4-3 5.4-3 8.5" />
    </svg>
  );
}

function Ghungroo(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 7c3-1.6 6-1.6 9 0s6 1.6 9 0" />
      <circle cx="6.5" cy="12.5" r="2.3" />
      <circle cx="12" cy="14" r="2.3" />
      <circle cx="17.5" cy="12.5" r="2.3" />
      <path d="M6.5 10.2V8.5M12 11.7V9.5M17.5 10.2V8.5" />
    </svg>
  );
}

function Diya(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M11.4 3.2c-1.6.9-1.2 2.8.6 3.1 1.4.2 2-1 1.4-2.3-.5.9-1.4.6-2-.8Z" />
      <path d="M4 13c1.6 2 4.6 3 8 3s6.4-1 8-3" />
      <path d="M6 13.5c.6 1.2 3 2 6 2s5.4-.8 6-2" />
      <path d="M12 8.5v3" />
    </svg>
  );
}

function Quill(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 20c6-1 9-4 12-9 1.4-2.3 2.6-5 2.6-7-3 .4-6 1.4-8.4 4C7.2 12 5.4 15.8 4 20Z" />
      <path d="M7 17c2.4-.4 4.4-1.6 6-3.4" />
      <path d="M4 20l2.3-2.3" />
    </svg>
  );
}

function Scroll(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 4h11a2 2 0 0 1 2 2v11" />
      <path d="M17 17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 0-2-2" />
      <path d="M8.5 8.5h6M8.5 12h6M8.5 15.5h3.5" />
    </svg>
  );
}

function Peacock(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 21c4-2 6-5.6 6-10 0-3.3-2.7-6-6-6" />
      <path d="M12 21c-4-2-6-5.6-6-10 0-3.3 2.7-6 6-6" />
      <ellipse cx="12" cy="9" rx="2.4" ry="3.4" />
      <circle cx="12" cy="9" r="0.9" />
    </svg>
  );
}

function Tabla(p: IconProps) {
  return (
    <svg {...base(p)}>
      <ellipse cx="8" cy="8" rx="4" ry="1.6" />
      <path d="M4 8v6c0 1 1.8 1.8 4 1.8s4-.8 4-1.8V8" />
      <circle cx="8" cy="8" r="1.1" />
      <ellipse cx="17" cy="10" rx="3.2" ry="1.3" />
      <path d="M13.8 10v4c0 .9 1.4 1.5 3.2 1.5s3.2-.6 3.2-1.5v-4" />
    </svg>
  );
}

function Sun(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5M12 19v2.5M4.5 4.5l1.8 1.8M17.7 17.7l1.8 1.8M2.5 12h2.5M19 12h2.5M4.5 19.5l1.8-1.8M17.7 6.3l1.8-1.8" />
    </svg>
  );
}

function Moon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
    </svg>
  );
}

function Search(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l4.5 4.5" />
    </svg>
  );
}

function ChevronDown(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 9.5l6 6 6-6" />
    </svg>
  );
}

function Book(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 6.5C9.6 4.9 6 4.6 3.5 5.4v12.4c2.5-.8 6.1-.5 8.5 1.1 2.4-1.6 6-1.9 8.5-1.1V5.4C18 4.6 14.4 4.9 12 6.5Z" />
      <path d="M12 6.5v12.5" />
    </svg>
  );
}

function Mask(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 5.2c5.3 1.4 10.7 1.4 16 0 .4 6.6-2.9 12.8-8 12.8S3.6 11.8 4 5.2Z" />
      <path d="M8.5 9.5c.8-.6 1.9-.6 2.7 0M12.8 9.5c.8-.6 1.9-.6 2.7 0" />
      <path d="M9 13.5c1.8 1.4 4.2 1.4 6 0" />
    </svg>
  );
}

function Quote(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 7C6.8 7 5 8.9 5 11.2 5 13.3 6.6 15 8.6 15c.2 2-1 3.4-3 4 4 0 7-3 7-7.8C12.6 8.4 11 7 9 7Z" />
      <path d="M19 7c-2.2 0-4 1.9-4 4.2 0 2.1 1.6 3.8 3.6 3.8.2 2-1 3.4-3 4 4 0 7-3 7-7.8C22.6 8.4 21 7 19 7Z" />
    </svg>
  );
}

function Calendar(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="1" />
      <path d="M4 9.5h16M8.5 3.5v4M15.5 3.5v4" />
    </svg>
  );
}

function Document(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M7 3.5h6.5L18 8v12.5H7Z" />
      <path d="M13.2 3.6V8H18" />
      <path d="M9.5 12.5h5M9.5 15.5h5" />
    </svg>
  );
}

function Archive(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="4" y="5" width="16" height="4" rx="0.5" />
      <path d="M5.2 9v9.5c0 .6.4 1 1 1h11.6c.6 0 1-.4 1-1V9" />
      <path d="M10 13h4" />
    </svg>
  );
}

function Home(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 11l8-6.5 8 6.5" />
      <path d="M6 10v9.5h12V10" />
      <path d="M10 19.5v-5h4v5" />
    </svg>
  );
}

function User(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 19.5c1-3.5 4-5.2 6.5-5.2s5.5 1.7 6.5 5.2" />
    </svg>
  );
}

function Menu(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function Close(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function Check(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function Alert(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 4.5l8.3 14.5H3.7Z" />
      <path d="M12 10v4.2M12 16.8v.5" />
    </svg>
  );
}

function Play(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M7.5 5.2l10.5 6.8-10.5 6.8Z" />
    </svg>
  );
}

function Pause(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M8.5 5v14M15.5 5v14" />
    </svg>
  );
}

function Stop(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

function Mic(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="9.5" y="3.5" width="5" height="10" rx="2.5" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v3.5M9 20.5h6" />
    </svg>
  );
}

function Trash(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 7h14M10 7V4.8h4V7M6.5 7l1 12.2h9L17.5 7" />
    </svg>
  );
}

function Plus(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function Star(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 4l2.5 5.1 5.6.8-4.1 4 1 5.6L12 16.9 7 19.5l1-5.6-4.1-4 5.6-.8Z" />
    </svg>
  );
}

function Printer(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M7 9.5V4.5h10v5" />
      <rect x="4.5" y="9.5" width="15" height="6.5" rx="1" />
      <path d="M7 14h10v5.5H7z" />
    </svg>
  );
}

function Download(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 4v10M8 10.5l4 4 4-4" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

function Edit(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M15 5l4 4" />
      <path d="M4 20l1-4L16 5l3 3L9 19Z" />
    </svg>
  );
}

function ArrowRight(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ArrowLeft(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

function Lock(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="5" y="10.5" width="14" height="9" rx="1" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

function Unlock(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="5" y="10.5" width="14" height="9" rx="1" />
      <path d="M8 10.5V8a4 4 0 0 1 7.6-1.8" />
    </svg>
  );
}

function Pin(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9.5 4h5M10.5 4l-.6 6-2.4 2v1h9v-1l-2.4-2-.6-6M12 13v6.5" />
    </svg>
  );
}

function Image(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="4" y="5" width="16" height="14" rx="1" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M4.5 17l4.5-4.5 3 3L16 11l3.5 3.5" />
    </svg>
  );
}

function ListBullet(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="5" cy="7" r="1.1" />
      <circle cx="5" cy="12" r="1.1" />
      <circle cx="5" cy="17" r="1.1" />
      <path d="M9 7h11M9 12h11M9 17h11" />
    </svg>
  );
}

function ListNumber(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 7h11M9 12h11M9 17h11" />
      <path d="M4 5.5l1-.5V9M4 14.5h1.8l-1.8 2.2h1.9" />
    </svg>
  );
}

function Rule(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 12h16" />
    </svg>
  );
}

export const Icon = {
  Lotus,
  Ghungroo,
  Diya,
  Quill,
  Scroll,
  Peacock,
  Tabla,
  Sun,
  Moon,
  Search,
  ChevronDown,
  Book,
  Mask,
  Quote,
  Calendar,
  Document,
  Archive,
  Home,
  User,
  Menu,
  Close,
  Check,
  Alert,
  Play,
  Pause,
  Stop,
  Mic,
  Trash,
  Plus,
  Star,
  Printer,
  Download,
  Edit,
  ArrowRight,
  ArrowLeft,
  Lock,
  Unlock,
  Pin,
  Image,
  ListBullet,
  ListNumber,
  Rule,
};

/** Which bespoke icon represents each media kind. */
export const MediaIcon: Record<MediaKind, (p: IconProps) => ReturnType<typeof Lotus>> = {
  image: Image,
  audio: Ghungroo,
  video: Mask,
  pdf: Document,
};
