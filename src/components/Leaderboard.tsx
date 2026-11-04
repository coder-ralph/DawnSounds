"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cloud, CloudOff, Flame, Trash2, Trophy } from "lucide-react";
import { useT } from "@/components/LanguageProvider";
import { RankEmblem, type PodiumRank } from "@/components/RankEmblem";
import { clearScores, fetchGlobalScores, loadScores, modeKey, supabaseConfigured } from "@/lib/leaderboard";
import type { QuizMode, ScoreEntry } from "@/types";

type Filter = "all" | QuizMode;
type Source = "loading" | "global" | "local";

const MEDAL = ["text-amber-300", "text-slate-200", "text-orange-300"];

// Chamfered, pointed-bottom "shield" outline for the podium cards (the border is a 2px gradient frame around a second, inner clip).
const SHIELD = "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 16px), 50% 100%, 0 calc(100% - 16px), 0 12px)";

/** Podium styling per place (index 0 = 1st). Full class strings so Tailwind can see them. */
const TIER = [
  {
    key: "lb.tierGold" as const,
    label: "text-amber-300",
    frame: "from-amber-100 via-amber-400 to-amber-700",
    fill: "from-amber-500/[0.22] via-ink-850 to-ink-900",
    score: "text-amber-300",
    pill: "bg-amber-400/10 text-amber-200 ring-amber-300/40",
    glow: "drop-shadow(0 0 16px rgb(251 191 36 / 0.45))",
  },
  {
    key: "lb.tierSilver" as const,
    label: "text-slate-200",
    frame: "from-slate-100 via-slate-400 to-slate-600",
    fill: "from-slate-300/[0.14] via-ink-850 to-ink-900",
    score: "text-slate-100",
    pill: "bg-slate-300/10 text-slate-200 ring-slate-300/30",
    glow: "drop-shadow(0 0 10px rgb(203 213 225 / 0.25))",
  },
  {
    key: "lb.tierBronze" as const,
    label: "text-orange-300",
    frame: "from-orange-200 via-orange-500 to-orange-800",
    fill: "from-orange-500/[0.16] via-ink-850 to-ink-900",
    score: "text-orange-300",
    pill: "bg-orange-400/10 text-orange-200 ring-orange-300/30",
    glow: "drop-shadow(0 0 10px rgb(251 146 60 / 0.3))",
  },
];

export function Leaderboard({ onPlay }: { onPlay: () => void }) {
  const t = useT();
  const [filter, setFilter] = useState<Filter>("all");
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [source, setSource] = useState<Source>("loading");
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(async () => {
    if (!supabaseConfigured) {
      setEntries(loadScores());
      setSource("local");
      return;
    }
    try {
      setEntries(await fetchGlobalScores());
      setSource("global");
    } catch {
      setEntries(loadScores());
      setSource("local");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = entries.filter((e) => filter === "all" || e.mode === filter).slice(0, 50);
  const top = shown.slice(0, 3);

  const clear = () => {
    if (!confirm) {
      setConfirm(true);
      window.setTimeout(() => setConfirm(false), 3000);
      return;
    }
    clearScores();
    setConfirm(false);
    load();
  };

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="mx-auto w-full max-w-3xl space-y-6">
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-400/10 ring-1 ring-violet-400/30">
          <Trophy className="size-7 text-violet-300" />
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide text-white sm:text-5xl">{t("lb.title")}</h1>
        <p className={`mx-auto mt-2 flex max-w-md items-start justify-center gap-2 text-center text-sm ${source === "local" && supabaseConfigured ? "text-amber-300/90" : "text-slate-400"}`}>
          {source === "global" ? <Cloud className="mt-0.5 size-4 shrink-0 text-cyan-300" /> : <CloudOff className="mt-0.5 size-4 shrink-0" />}
          {source === "global" ? t("lb.global") : source === "local" && supabaseConfigured ? t("lb.fallback") : source === "local" ? t("lb.local") : "…"}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div role="group" aria-label={t("lb.filterAria")} className="flex flex-wrap rounded-xl border border-white/10 bg-ink-850 p-1">
          {(["all", "classic", "survival", "trivia"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f} className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${filter === f ? "bg-violet-500 text-white" : "text-slate-400 hover:text-white"}`}>
              {f === "all" ? t("lb.all") : t(modeKey(f))}
            </button>
          ))}
        </div>
        {source === "local" && entries.length > 0 && (
          <button type="button" onClick={clear} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${confirm ? "bg-rose-500/20 text-rose-300" : "text-slate-500 hover:text-rose-300"}`}>
            <Trash2 className="size-3.5" />
            {confirm ? t("lb.confirm") : t("lb.clear")}
          </button>
        )}
      </div>

      {shown.length === 0 && source !== "loading" ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
          <p className="font-display text-2xl font-bold text-white">{t("lb.emptyTitle")}</p>
          <p className="mt-1 text-slate-400">{t("lb.emptyDesc")}</p>
          <button type="button" onClick={onPlay} className="mt-5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-bold text-ink-950">
            {t("lb.play")}
          </button>
        </div>
      ) : (
        <>
          {top.length > 0 && (
            <div className="grid grid-cols-[1fr_1.2fr_1fr] items-end gap-2 pt-1 sm:gap-5" aria-label={t("lb.podium")} role="group">
              {[1, 0, 2].map((pos) => {
                const e = top[pos];
                if (!e) return <div key={pos} />;
                const tier = TIER[pos];
                const gold = pos === 0;
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: pos * 0.08 }}
                    aria-label={`${t(tier.key)}: ${e.ign}, ${e.score.toLocaleString("en-US")}`}
                    role="group"
                    className="flex min-w-0 flex-col items-center"
                    style={{ filter: tier.glow }}
                  >
                    <p className={`mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-xs ${tier.label}`}>{t(tier.key)}</p>
                    <RankEmblem rank={(pos + 1) as PodiumRank} className={`relative z-10 -mb-7 h-auto drop-shadow-[0_4px_6px_rgb(0_0_0/0.5)] sm:-mb-10 ${gold ? "w-[5.5rem] sm:w-36" : "w-[4.25rem] sm:w-28"}`} />
                    <div className={`w-full bg-gradient-to-b p-[2px] ${tier.frame}`} style={{ clipPath: SHIELD }}>
                      <div className={`flex min-w-0 flex-col items-center bg-gradient-to-b px-1.5 text-center ${tier.fill} ${gold ? "pb-8 pt-9 sm:pb-12 sm:pt-14" : "pb-6 pt-7 sm:pb-9 sm:pt-11"}`} style={{ clipPath: SHIELD }}>
                        <p className={`line-clamp-2 w-full break-words px-0.5 font-display font-bold leading-tight text-white ${gold ? "text-base sm:text-2xl" : "text-sm sm:text-lg"}`}>{e.ign}</p>
                        <p className={`font-display font-bold leading-tight tabular-nums ${tier.score} ${gold ? "text-[1.7rem] sm:text-5xl" : "text-xl sm:text-3xl"}`}>{e.score.toLocaleString("en-US")}</p>
                        <span className={`mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 sm:text-[11px] ${tier.pill}`}>{t(modeKey(e.mode))}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <ol className="space-y-2">
            <AnimatePresence initial={false}>
              {shown.map((e, i) => (
                <motion.li key={e.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 12) * 0.02 }} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-ink-850 px-4 py-3">
                  <span className={`w-7 text-center font-display text-xl font-bold tabular-nums ${i < 3 ? MEDAL[i] : "text-slate-500"}`}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{e.ign}</p>
                    <p className="truncate text-xs text-slate-500">
                      {t(modeKey(e.mode))} · {e.accuracy}%{e.correct != null && e.total != null ? ` · ${e.correct}/${e.total}` : ""} · {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  {e.bestStreak != null && (
                    <span className="hidden items-center gap-1 text-xs text-amber-400 sm:inline-flex">
                      <Flame className="size-3.5" /> {e.bestStreak}
                    </span>
                  )}
                  <span className="font-display text-xl font-bold tabular-nums text-cyan-300">{e.score.toLocaleString("en-US")}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </>
      )}
    </motion.section>
  );
}
