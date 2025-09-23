import { cn } from "@/lib/utils";

export type HumanAvatarProps = {
  size?: number;
  className?: string;
  skin?: string; // hex
  hair?: string; // hex
  shirt?: string; // hex
  accent?: string; // ring/glow
};

export default function HumanAvatar({
  size = 40,
  className,
  skin = "#f4d1b5",
  hair = "#2f2f2f",
  shirt = "#2563eb",
  accent = "#22c55e",
}: HumanAvatarProps) {
  const s = size;
  const svg = Math.round(s * 0.82);
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        "bg-gradient-to-br from-emerald-500/50 to-green-700/50 ring-2",
        className
      )}
      style={{ width: s, height: s, boxShadow: `0 0 24px ${accent}40` }}
      aria-label="Human tutor avatar"
    >
      <svg width={svg} height={svg} viewBox="0 0 128 128" aria-hidden>
        <g>
          {/* Shoulders/Shirt */}
          <path d="M20 112c6-18 28-26 44-26s38 8 44 26l-44 8z" fill={shirt} />
          {/* Neck */}
          <rect x="56" y="74" width="16" height="16" rx="4" fill={skin} />
          {/* Head */}
          <circle cx="64" cy="56" r="22" fill={skin} />
          {/* Hair */}
          <path d="M42 52c2-16 18-24 22-24 10 0 24 8 24 22 0 6-2 6-4 8-2-12-12-14-20-14-10 0-16 4-22 8z" fill={hair} />
          {/* Eyes */}
          <circle cx="56" cy="56" r="2.6" fill="#0a0a0a" />
          <circle cx="72" cy="56" r="2.6" fill="#0a0a0a" />
          {/* Smile */}
          <path d="M56 64c3.5 4 12.5 4 16 0" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}
