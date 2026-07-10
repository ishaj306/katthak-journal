/**
 * Hand-drawn Mughal-manuscript SVG ornaments.
 * All strokes use currentColor so callers control the hue with text-*.
 * These are decorative — every one is aria-hidden.
 */

type OrnProps = {
  className?: string;
  size?: number;
};

export function GhungrooMandala({ className, size = 120 }: OrnProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <circle cx="60" cy="60" r="10" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="4" fill="currentColor" stroke="none" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r1 = 20;
        const r2 = 44;
        const x1 = 60 + Math.cos(a) * r1;
        const y1 = 60 + Math.sin(a) * r1;
        const x2 = 60 + Math.cos(a) * r2;
        const y2 = 60 + Math.sin(a) * r2;
        const bx = 60 + Math.cos(a) * (r2 + 8);
        const by = 60 + Math.sin(a) * (r2 + 8);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.8" />
            <circle cx={bx} cy={by} r="4.5" strokeWidth="1" />
            <circle cx={bx} cy={by} r="1.4" fill="currentColor" stroke="none" />
          </g>
        );
      })}
      <circle cx="60" cy="60" r="52" strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
}

export function LotusMotif({ className, size = 80 }: OrnProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size * 0.7}
      viewBox="0 0 100 70"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path d="M50 62 C50 40 50 30 50 14" strokeWidth="1" />
      <path d="M50 62 C34 46 30 30 38 18 C46 30 50 44 50 62Z" strokeWidth="1" />
      <path d="M50 62 C66 46 70 30 62 18 C54 30 50 44 50 62Z" strokeWidth="1" />
      <path d="M50 62 C30 54 18 42 20 30 C36 34 46 48 50 62Z" strokeWidth="0.9" opacity="0.8" />
      <path d="M50 62 C70 54 82 42 80 30 C64 34 54 48 50 62Z" strokeWidth="0.9" opacity="0.8" />
      <circle cx="50" cy="12" r="3" strokeWidth="1" />
    </svg>
  );
}

export function LotusBloom({ className, size = 120 }: OrnProps) {
  const outer = "M60 60 C50 38 50 22 60 8 C70 22 70 38 60 60Z";
  const middle = "M60 60 C53 44 53 32 60 22 C67 32 67 44 60 60Z";
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={`o${i}`}
          d={outer}
          strokeWidth="1.1"
          transform={`rotate(${i * 45} 60 60)`}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={`m${i}`}
          d={middle}
          strokeWidth="1"
          opacity="0.85"
          transform={`rotate(${i * 45 + 22.5} 60 60)`}
        />
      ))}
      <circle cx="60" cy="60" r="7" strokeWidth="1.1" />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <circle
            key={`d${i}`}
            cx={60 + Math.cos(a) * 3.5}
            cy={60 + Math.sin(a) * 3.5}
            r="0.9"
            fill="currentColor"
            stroke="none"
          />
        );
      })}
    </svg>
  );
}

export function CypressTree({ className, size = 60 }: OrnProps) {
  return (
    <svg
      className={className}
      width={size * 0.5}
      height={size}
      viewBox="0 0 40 80"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path
        d="M20 4 C10 22 12 40 20 54 C28 40 30 22 20 4Z"
        strokeWidth="1"
      />
      <path d="M20 12 C16 24 16 40 20 50" strokeWidth="0.5" opacity="0.6" />
      <line x1="20" y1="54" x2="20" y2="72" strokeWidth="1" />
      <path d="M12 72 H28" strokeWidth="1" />
    </svg>
  );
}

export function DancerSilhouette({ className, size = 160 }: OrnProps) {
  return (
    <svg
      className={className}
      width={size * 0.6}
      height={size}
      viewBox="0 0 96 160"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      {/* Head */}
      <circle cx="50" cy="20" r="9" strokeWidth="1.4" />
      {/* Torso in a tribhanga-like bend */}
      <path
        d="M50 29 C48 44 44 52 46 66 C47 78 44 92 40 104"
        strokeWidth="1.6"
      />
      {/* Arms — one raised, one extended */}
      <path d="M48 40 C36 34 26 26 20 14" strokeWidth="1.4" />
      <path d="M20 14 L14 10 M20 14 L24 8" strokeWidth="1" />
      <path d="M48 46 C62 48 74 54 82 64" strokeWidth="1.4" />
      <path d="M82 64 L88 62 M82 64 L84 70" strokeWidth="1" />
      {/* Skirt / lehenga */}
      <path
        d="M40 104 C28 116 22 132 26 150 L74 150 C74 132 66 116 54 104"
        strokeWidth="1.4"
      />
      <path d="M34 128 C46 134 58 134 68 126" strokeWidth="0.6" opacity="0.6" />
      {/* Feet */}
      <path d="M40 150 L36 156 M58 150 L62 156" strokeWidth="1.2" />
    </svg>
  );
}

export function JaliPattern({
  className,
  opacity = 0.06,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      aria-hidden
      style={{ opacity }}
    >
      <defs>
        <pattern
          id="jali"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <path
            d="M20 0 L40 20 L20 40 L0 20 Z"
            fill="none"
            stroke="#6B1E2A"
            strokeWidth="0.75"
          />
          <circle cx="20" cy="20" r="3" fill="none" stroke="#B8893E" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#jali)" />
    </svg>
  );
}

export function Shamsa({ className, size = 200 }: OrnProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <circle cx="100" cy="100" r="30" strokeWidth="1" />
      <circle cx="100" cy="100" r="20" strokeWidth="0.6" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const inner = 30;
        const outer = i % 2 === 0 ? 60 : 48;
        const x1 = 100 + Math.cos(a) * inner;
        const y1 = 100 + Math.sin(a) * inner;
        const x2 = 100 + Math.cos(a) * outer;
        const y2 = 100 + Math.sin(a) * outer;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.7" />;
      })}
      <circle cx="100" cy="100" r="70" strokeWidth="0.5" opacity="0.5" />
      <circle cx="100" cy="100" r="86" strokeWidth="0.4" opacity="0.3" />
    </svg>
  );
}

export function CornerFlourish({ className, size = 64 }: OrnProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path d="M2 2 H24 M2 2 V24" strokeWidth="1.2" />
      <path
        d="M8 8 C22 10 30 18 32 32 C34 18 42 10 56 8"
        strokeWidth="0.8"
        opacity="0.8"
      />
      <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
