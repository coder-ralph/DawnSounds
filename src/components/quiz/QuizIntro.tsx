"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, CalendarDays, CheckCircle2, Flame, Heart, Infinity as InfinityIcon, Play, Timer, Zap } from "lucide-react";
import { useT } from "@/components/LanguageProvider";
import { useDaily } from "@/components/quiz/useDaily";
import { assetStats, assetsScanned } from "@/lib/assets";
import { STORAGE_KEYS } from "@/lib/constants";
import { CLASSIC_ROUNDS, ROUND_SECONDS, SURVIVAL_LIVES } from "@/lib/quiz";
import { readJSON, writeJSON } from "@/lib/storage";
import type { QuizMode } from "@/types";

export const IGN_MIN = 2;
export const IGN_MAX = 16;

export function QuizIntro({ onStart, onViewDaily, poolSize, totalHeroes, speechFallback }: { onStart: (mode: QuizMode, ign: string) => void; onViewDaily: () => void; poolSize: number; totalHeroes: number; speechFallback: boolean }) {
  const t = useT();
  const daily = useDaily();
  const [ign, setIgn] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const saved = readJSON<string>(STORAGE_KEYS.ign, "");
    if (typeof saved === "string") setIgn(saved.slice(0, IGN_MAX));
  }, []);

  const trimmed = ign.trim();
  const valid = trimmed.length >= IGN_MIN && trimmed.length <= IGN_MAX;
  const showErr = touched && !valid;

  const start = (mode: QuizMode) => {
    setTouched(true);
    if (!valid) return;
    writeJSON(STORAGE_KEYS.ign, trimmed);
    onStart(mode, trimmed);
  };

  const status = daily?.status ?? "open";
  const classicLocked = status !== "open";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="mx-auto w-full max-w-4xl space-y-8">
      <div className="text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <Zap className="size-3.5" />
          {t("qi.badge")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide text-white sm:text-5xl">{t("qi.title")}</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-400">{t("qi.desc", { seconds: ROUND_SECONDS })}</p>
      </div>

      <div className="mx-auto max-w-md">
        <label htmlFor="ign" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          {t("qi.ign")}
        </label>
        <input
          id="ign"
          value={ign}
          maxLength={IGN_MAX}
          onChange={(e) => setIgn(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={t("qi.ignPh")}
          autoComplete="nickname"
          aria-invalid={showErr}
          aria-describedby="ign-help"
          className={`w-full rounded-xl border bg-ink-850 px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none ${showErr ? "border-rose-400/60" : "border-white/10 focus:border-cyan-400/50"}`}
        />
        <p id="ign-help" className={`mt-1.5 text-xs ${showErr ? "text-rose-300" : "text-slate-500"}`}>
          {showErr ? t("qi.ignErr", { min: IGN_MIN, max: IGN_MAX }) : t("qi.ignHelp")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* ── Classic = Daily Challenge ── */}
        <motion.div whileHover={classicLocked ? undefined : { y: -3 }} className={`relative flex flex-col rounded-3xl border p-6 ${status === "done" ? "border-emerald-400/30 bg-emerald-400/[0.04]" : "border-white/[0.08] bg-ink-850"}`}>
          <div className="flex items-start justify-between gap-2">
            <span className="grid size-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/30">{status === "done" ? <CalendarCheck className="size-6" /> : <CalendarDays className="size-6" />}</span>
            <div className="flex flex-wrap justify-end gap-1.5">
              {daily && <span className="rounded-md bg-amber-400/10 px-2 py-1 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/30">{t("qi.dailyChip", { n: daily.n })}</span>}
              {status === "done" && (
                <span className="flex items-center gap-1 rounded-md bg-emerald-400/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                  <CheckCircle2 className="size-3.5" />
                  {t("qi.doneBadge")}
                </span>
              )}
              {status === "used" && <span className="rounded-md bg-rose-500/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-rose-300">{t("qi.usedBadge")}</span>}
            </div>
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-white">{t("qi.classicTitle")}</h2>

          {status === "done" ? (
            <p className="mt-1.5 text-sm font-semibold text-emerald-300">{t("qi.doneSafe")}</p>
          ) : status === "used" ? (
            <p className="mt-1.5 text-sm text-slate-400">{t("qi.usedDesc", { n: daily?.nextN ?? 2 })}</p>
          ) : (
            <p className="mt-1.5 text-sm text-slate-400">{t("qi.classicDesc", { rounds: CLASSIC_ROUNDS })}</p>
          )}

          {daily && daily.streak > 0 && (
            <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-orange-400/10 px-2.5 py-1 text-xs font-bold text-orange-300">
              <Flame className="size-3.5" />
              {t("qi.dayStreak", { n: daily.streak })}
            </p>
          )}

          <div className="mt-auto pt-5">
            {classicLocked ? (
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm text-slate-400" aria-live="off">
                  <Timer className="size-4 text-slate-500" />
                  {t("qi.doneNext", { time: daily?.countdown ?? "--:--:--" })}
                </p>
                {status === "done" && (
                  <button type="button" onClick={onViewDaily} className="w-full rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 font-bold text-emerald-300 transition-colors hover:bg-emerald-400/20">
                    {t("qi.doneView")}
                  </button>
                )}
              </div>
            ) : (
              <motion.button type="button" onClick={() => start("classic")} disabled={!daily} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-bold text-ink-950 disabled:opacity-60">
                <Play className="size-4" />
                {t("qi.classicCta", { n: daily?.n ?? "…" })}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ── Survival: unlimited ── */}
        <motion.div whileHover={{ y: -3 }} className="relative flex flex-col rounded-3xl border border-white/[0.08] bg-ink-850 p-6">
          <div className="flex items-start justify-between gap-2">
            <span className="grid size-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30">
              <Heart className="size-6" />
            </span>
            <span className="flex items-center gap-1 rounded-md bg-cyan-400/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
              <InfinityIcon className="size-3.5" />
              {t("qi.survivalBadge")}
            </span>
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-white">{t("qi.survivalTitle")}</h2>
          <p className="mt-1.5 text-sm text-slate-400">{t("qi.survivalDesc", { lives: SURVIVAL_LIVES })}</p>
          <div className="mt-auto pt-5">
            <motion.button type="button" onClick={() => start("survival")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-bold text-ink-950">
              <Play className="size-4" />
              {t("qi.survivalCta")}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {speechFallback ? (
        <p className="text-center text-xs text-amber-300/80">{assetsScanned && assetStats.withAudio > 0 ? t("qi.noteSpeechSome", { n: assetStats.withAudio }) : t("qi.noteSpeechNone")}</p>
      ) : poolSize < totalHeroes ? (
        <p className="text-center text-xs text-slate-500">{t("qi.notePool", { pool: poolSize, total: totalHeroes })}</p>
      ) : null}
    </motion.div>
  );
}
