import { useId } from "react";

export type PodiumRank = 1 | 2 | 3;

/** Metallic palettes: [light, mid, dark] for the winged crest. */
const METAL: Record<PodiumRank, [string, string, string]> = {
  1: ["#fef3c7", "#fbbf24", "#b45309"],
  2: ["#f8fafc", "#a8b3c7", "#4b5870"],
  3: ["#fed7aa", "#e0833f", "#7c3412"],
};

/**
 * Winged crest for the leaderboard podium — an original, MLBB-inspired emblem drawn in SVG:
 * wings + crown + a medallion holding a star (1st) or the rank number (2nd / 3rd).
 */
export function RankEmblem({ rank, className = "" }: { rank: PodiumRank; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [light, mid, dark] = METAL[rank];
  const g = `m${uid}`;
  const wing = (
    <g>
      <path d="M43 52 C28 55 11 45 3 25 C13 31 22 32 29 29 C25 36 32 41 43 42 Z" fill={`url(#${g})`} />
      <path d="M43 56 C31 60 19 56 9 45 C17 47 24 46 31 43 C28 48 34 51 43 51 Z" fill={`url(#${g})`} opacity="0.92" />
      <path d="M43 60 C35 66 25 66 16 61 C24 61 29 59 35 56 C37 58 39 58 43 57 Z" fill={`url(#${g})`} opacity="0.8" />
      <path d="M43 52 C28 55 11 45 3 25" fill="none" stroke={light} strokeWidth="0.8" opacity="0.8" />
    </g>
  );
  return (
    <svg viewBox="0 0 120 84" className={className} role="img" aria-label={rank === 1 ? "1st place" : rank === 2 ? "2nd place" : "3rd place"}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <radialGradient id={`${g}d`} cx="0.5" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#1e293b" />
          <stop offset="1" stopColor="#070b14" />
        </radialGradient>
      </defs>
      {wing}
      <g transform="translate(120 0) scale(-1 1)">{wing}</g>
      {/* crown */}
      <path d="M46 33 L49 19 L55 26 L60 12 L65 26 L71 19 L74 33 Z" fill={`url(#${g})`} stroke={dark} strokeWidth="0.6" strokeLinejoin="round" />
      <rect x="46" y="31" width="28" height="3.5" rx="1.2" fill={`url(#${g})`} stroke={dark} strokeWidth="0.5" />
      {/* medallion */}
      <circle cx="60" cy="54" r="19" fill={`url(#${g})`} />
      <circle cx="60" cy="54" r="15.5" fill={`url(#${g}d)`} stroke={dark} strokeWidth="0.8" />
      <circle cx="60" cy="54" r="12.5" fill="none" stroke={mid} strokeWidth="0.7" opacity="0.7" />
      {rank === 1 ? (
        <path d="M60 44 L63.1 50.6 L70.3 51.4 L65 56.3 L66.5 63.4 L60 59.9 L53.5 63.4 L55 56.3 L49.7 51.4 L56.9 50.6 Z" fill={`url(#${g})`} stroke={dark} strokeWidth="0.5" strokeLinejoin="round" />
      ) : (
        <text x="60" y="63" textAnchor="middle" fontSize="23" fontWeight="800" fill={`url(#${g})`} stroke={dark} strokeWidth="0.4" style={{ fontFamily: "var(--font-display, Rajdhani), system-ui, sans-serif" }}>
          {rank}
        </text>
      )}
      {/* pointed tail */}
      <path d="M52 71 L60 82 L68 71 Z" fill={`url(#${g})`} stroke={dark} strokeWidth="0.5" strokeLinejoin="round" />
    </svg>
  );
}
