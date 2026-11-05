"use client";

import { Gem, Swords, Zap } from "lucide-react";
import { useT } from "@/components/LanguageProvider";
import { BADGE_RULES, type BadgeTier } from "@/lib/quiz";
import type { QuizMode } from "@/types";

/** Full class strings per tier so Tailwind can see them. `glow` is an "r g b" triple read by .rank-badge in globals.css. */
const STYLE = {
  savage: { key: "badge.savage", Icon: Swords, frame: "from-orange-300 via-rose-500 to-orange-600", text: "text-orange-200", glow: "251 113 60" },
  godlike: { key: "badge.godlike", Icon: Zap, frame: "from-cyan-200 via-sky-400 to-blue-500", text: "text-cyan-100", glow: "56 189 248" },
  mythic: { key: "badge.mythic", Icon: Gem, frame: "from-amber-200 via-fuchsia-500 to-violet-500", text: "text-amber-100", glow: "192 132 252" },
} as const;

const ALIGN = { start: "left-0", center: "left-1/2 -translate-x-1/2", end: "right-0" } as const;

/**
 * Prestige badge for a run that came within reach of the maximum score for its length (see `badgeFor` in lib/quiz.ts).
 * Gradient frame + glow + a slow shimmer (all switched off for reduced-motion users). The tooltip is plain CSS (display-toggled, so a closed tooltip never adds page width) and also opens on
 * keyboard focus and touch; `align` keeps it on screen when the badge sits at an edge.
 */
export function RankBadge({ tier, mode, total, align = "center", className = "" }: { tier: BadgeTier; mode: QuizMode; total?: number | null; align?: keyof typeof ALIGN; className?: string }) {
  const t = useT();
  const s = STYLE[tier];
  const rule = BADGE_RULES[tier];
  const modeName = mode === "trivia" ? `${t("mode.trivia")} (${t("qi.lenQuestions", { n: total ?? 10 })})` : t(`mode.${mode}`);
  const params = { tier: t(s.key), pct: Math.round(rule.pct * 100), mode: modeName };
  const tip = t(rule.flawless ? "badge.tipFlawless" : "badge.tip", params);

  return (
    <span
      tabIndex={0}
      role="img"
      aria-label={tip}
      className={`group relative inline-flex shrink-0 rounded-md bg-gradient-to-r p-[1.5px] outline-offset-2 ${s.frame} rank-badge ${className}`}
      style={{ "--glow": s.glow } as React.CSSProperties}
    >
      <span className="relative flex items-center gap-1 overflow-hidden rounded-[5px] bg-ink-950 px-1.5 py-0.5 text-[9px] font-extrabold uppercase leading-none tracking-[0.12em] sm:text-[10px]">
        <s.Icon className={`size-3 ${s.text}`} aria-hidden />
        <span className={s.text}>{params.tier}</span>
        <span className="rank-badge-shine pointer-events-none absolute inset-0" aria-hidden />
      </span>
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full z-30 mb-2 hidden w-max max-w-[min(13.5rem,calc(100vw-2rem))] rounded-lg border border-white/10 bg-ink-800 px-2.5 py-1.5 text-left text-[11px] font-medium normal-case leading-snug tracking-normal text-slate-200 shadow-xl group-hover:block group-focus:block ${ALIGN[align]}`}
      >
        {tip}
      </span>
    </span>
  );
}
