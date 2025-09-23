import { cn } from "@/lib/utils";

type HeroProps = {
  size?: number;
  className?: string;
  skin?: string; // hex
  primary?: string; // hex
  accent?: string; // hex
  showCape?: boolean;
  showMask?: boolean;
  emblem?: "leaf" | "water" | "bolt" | "heart";
};

export default function CharacterAvatar({
  size = 40,
  className,
  skin = "#fef3c7",
  primary = "#22c55e",
  accent = "#10b981",
  showCape = true,
  showMask = true,
  emblem = "leaf",
}: HeroProps) {
  const s = size;
  const svgSize = Math.round(s * 0.82);
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/60 to-green-700/60 ring-2 ring-emerald-400/40",
        className,
      )}
      style={{ width: s, height: s }}
      aria-label="Eco buddy avatar"
    >
      <svg width={svgSize} height={svgSize} viewBox="0 0 128 128" aria-hidden>
        <g>
          {/* Cape */}
          {showCape && (
            <path d="M20,110 C36,72 92,72 108,110 L64,120 Z" fill={accent} opacity="0.85" />
          )}
          {/* Torso */}
          <rect x="44" y="68" width="40" height="34" rx="10" fill={primary} />
          {/* Emblem */}
          <circle cx="64" cy="84" r="10" fill="#fff" />
          {emblem === "leaf" && (
            <path d="M64 76c8 4 10 14 0 16-10-2-8-12 0-16Z" fill={accent} />
          )}
          {emblem === "water" && (
            <path d="M64 76c6 6 10 10 10 14a10 10 0 1 1-20 0c0-4 4-8 10-14Z" fill={accent} />
          )}
          {emblem === "bolt" && (
            <path d="M60 78h8l-4 8h8l-16 16 6-12h-8z" fill={accent} />
          )}
          {emblem === "heart" && (
            <path d="M64 86c14-10-6-18-6-8 0-10-20-2-6 8 8 6 12 6 12 6s4 0 12-6Z" fill={accent} />
          )}
          {/* Head */}
          <circle cx="64" cy="48" r="20" fill={skin} />
          {/* Eyes & smile */}
          <circle cx="56" cy="46" r="2.5" fill="#001b12" />
          <circle cx="72" cy="46" r="2.5" fill="#001b12" />
          <path d="M56 54c3 4 13 4 16 0" stroke="#001b12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Mask */}
          {showMask && (
            <path d="M48 42h32v8c-10 6-22 6-32 0z" fill={accent} opacity="0.8" />
          )}
          {/* Leaves hair */}
          <path d="M64 22c10 3 16 12 16 12s-11 3-16-2c-5 5-16 2-16 2s6-9 16-12c-2 9-2 12-2 12 0 0 2-5 2-12Z" fill="#34d399" stroke="#059669" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
