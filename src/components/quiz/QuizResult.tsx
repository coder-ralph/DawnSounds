"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ClipboardCopy, Flame, Grid3x3, Share2, Trophy } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { useT } from "@/components/LanguageProvider";
import { gridEmoji, ShareGrid } from "@/components/quiz/ShareGrid";
import type { SubmitOutcome } from "@/lib/leaderboard";
import type { QuizMode } from "@/types";

export interface ResultData {
  mode: QuizMode;
  ign: string;
  score: number;
  correct: number;
  total: number;
  accuracy: number;
  bestStreak: number;
  history: boolean[];
  daily: { n: number; streak: number; bestStreak: number } | null;
  /** null while the global submit is in flight, or when re-opening an old result */
  outcome: SubmitOutcome | null;
  /** true when `outcome` is simply not applicable (viewing a finished daily from the menu) */
  noOutcome?: boolean;
}

const gradeKey = (acc: number) => (acc >= 90 ? "rs.gradeLegendary" : acc >= 70 ? "rs.gradeMythic" : acc >= 50 ? "rs.gradeEpic" : "rs.gradeWarrior");
const modeName = (m: QuizMode) => (m === "classic" ? "Classic" : "Survival");

/** Share/clipboard text stays in English on purpose: it's posted to chats where the audience is mixed. */
export function summaryText(d: ResultData, url: string) {
  const lines = [
    `🎧 DawnSounds — ${modeName(d.mode)} Mode${d.daily ? ` (Daily #${d.daily.n})` : ""}`,
    `IGN: ${d.ign}`,
    `Score: ${d.score.toLocaleString("en-US")}`,
    `Accuracy: ${d.accuracy}% (${d.correct}/${d.total})`,
    `Best streak: ${d.bestStreak}`,
    url,
  ];
  return lines.join("\n");
}

export function dailyShareText(d: ResultData, url: string) {
  const n = d.daily?.n ?? 0;
  return [
    `DawnSounds Daily #${n} 🎧`,
    `${gridEmoji(d.history)}  ${d.correct}/${d.total} · ${d.score.toLocaleString("en-US")} pts`,
    d.daily && d.daily.streak > 0 ? `🔥 ${d.daily.streak}-day streak` : null,
    url,
  ]
    .filter(Boolean)
    .join("\n");
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function CopyButton({ text, label, className }: { text: () => string; label: string; className: string }) {
  const t = useT();
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        setState((await copy(text())) ? "ok" : "fail");
        window.setTimeout(() => setState("idle"), 2000);
      }}
      className={className}
    >
      {state === "ok" ? <Check className="size-4 text-emerald-400" /> : <ClipboardCopy className="size-4" />}
      {state === "ok" ? t("rs.copied") : state === "fail" ? t("rs.copyFail") : label}
    </button>
  );
}

export function QuizResult({ data, onAgain, onRanks, onMenu }: { data: ResultData; onAgain: () => void; onRanks: () => void; onMenu: () => void }) {
  const t = useT();
  const d = data;
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const secondary = "flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-white/25 hover:text-white";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="mx-auto w-full max-w-xl space-y-5 text-center">
      <div className="rounded-3xl border border-white/[0.08] bg-ink-850 p-6 sm:p-8">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-400/10 ring-1 ring-amber-400/30">
          <Trophy className="size-7 text-amber-400" />
        </div>
        {d.daily && <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-amber-300/90">{t("rs.daily", { n: d.daily.n })}</p>}
        <h2 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-white">{t(gradeKey(d.accuracy))}</h2>
        <p className="mt-1 text-sm text-slate-400">{t("rs.modeLine", { ign: d.ign, mode: t(d.mode === "classic" ? "mode.classic" : "mode.survival") })}</p>

        <div className="mt-5">
          <CountUp value={d.score} className="font-display text-6xl font-bold tabular-nums text-cyan-300" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t("rs.points")}</p>
          {d.outcome?.isBest && d.outcome.action !== "local" && d.outcome.action !== "inserted" && <p className="mt-2 text-sm font-bold text-emerald-300">{t("rs.best")}</p>}
        </div>

        <div className={`mt-6 grid gap-2.5 ${d.daily ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
          <Stat label={t("rs.accuracy")} value={`${d.accuracy}%`} />
          <Stat label={t("rs.correct")} value={`${d.correct}/${d.total}`} />
          <Stat label={t("rs.streak")} value={String(d.bestStreak)} />
          {d.daily ? (
            <Stat
              label={t("rs.dailyStreak")}
              value={String(d.daily.streak)}
              icon={<Flame className="size-4 text-orange-400" />}
            />
          ) : (
            d.outcome && d.outcome.rank > 0 && <Stat label={t("rs.rank")} value={`#${d.outcome.rank}`} />
          )}
        </div>
        {d.daily && d.outcome && d.outcome.rank > 0 && <p className="mt-3 text-xs text-slate-500">{t("rs.rank")}: #{d.outcome.rank} / {d.outcome.total}</p>}

        {d.daily && (
          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-ink-950/60 p-4">
            <p className="mb-3 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <Grid3x3 className="size-3.5" />
              {t("rs.dailyResult", { n: d.daily.n })}
            </p>
            <ShareGrid history={d.history} />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <CopyButton text={() => dailyShareText(d, url)} label={t("rs.copyResult")} className="flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-cyan-300" />
              {canShare && (
                <button
                  type="button"
                  onClick={() => navigator.share({ text: dailyShareText(d, url) }).catch(() => {})}
                  className="flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-cyan-300"
                >
                  <Share2 className="size-4" />
                  {t("rs.share")}
                </button>
              )}
            </div>
          </div>
        )}

        {d.daily && (
          <div className="mt-5 space-y-1">
            <p className="text-sm font-bold text-emerald-300">{t("rs.safe")}</p>
            <p className="text-xs text-slate-400">{t("rs.locked", { n: d.daily.n + 1 })}</p>
          </div>
        )}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {!d.daily && (
          <motion.button type="button" onClick={onAgain} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-bold text-ink-950 sm:col-span-2">
            {t("rs.again")}
          </motion.button>
        )}
        <button type="button" onClick={onRanks} className={secondary}>
          {t("rs.ranks")}
        </button>
        <button type="button" onClick={onMenu} className={secondary}>
          {t("rs.menu")}
        </button>
        <CopyButton text={() => summaryText(d, url)} label={t("rs.copy")} className={`${secondary} sm:col-span-2`} />
      </div>
    </motion.div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-3">
      <div className="flex items-center justify-center gap-1 font-display text-2xl font-bold text-white">
        {icon}
        {value}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</div>
    </div>
  );
}
