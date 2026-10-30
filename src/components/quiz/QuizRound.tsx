"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, Flame, Heart, Play, RotateCcw, X } from "lucide-react";
import { useAudio } from "@/components/AudioProvider";
import { HeroAvatar } from "@/components/HeroAvatar";
import { useT } from "@/components/LanguageProvider";
import { RoundTimer } from "@/components/quiz/RoundTimer";
import { isFinal, totalRounds, type QuizState } from "@/components/quiz/state";
import { Visualizer } from "@/components/Visualizer";
import { ROUND_SECONDS, SURVIVAL_LIVES, streakMultiplier } from "@/lib/quiz";

export function QuizRound({ state, onAnswer, onNext }: { state: QuizState; onAnswer: (slug: string | null, timeLeftMs: number) => void; onNext: () => void }) {
  const t = useT();
  const { play, stop, playingSlug } = useAudio();
  const q = state.questions[state.index];
  const feedback = state.phase === "feedback";
  const final = isFinal(state);
  const total = totalRounds(state);

  // Round clock: starts when the round mounts (the parent keys this component by round index).
  const startRef = useRef(0);
  const answeredRef = useRef(false);
  useEffect(() => {
    startRef.current = performance.now();
    answeredRef.current = false;
  }, []);
  const getLeftMs = useCallback(() => (startRef.current ? Math.max(0, ROUND_SECONDS * 1000 - (performance.now() - startRef.current)) : ROUND_SECONDS * 1000), []);

  const answer = useCallback(
    (slug: string | null) => {
      if (answeredRef.current) return;
      answeredRef.current = true;
      stop();
      onAnswer(slug, slug === null ? 0 : getLeftMs());
    },
    [getLeftMs, onAnswer, stop],
  );

  // Autoplay the round's voice line. The previous click (Start / Next) is the user gesture.
  useEffect(() => {
    play(q.hero);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.hero.slug]);

  const playing = playingSlug === q.hero.slug;
  const mult = streakMultiplier(state.streak);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="mx-auto w-full max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 font-display text-base font-bold text-white">{state.mode === "classic" ? t("qr.roundOf", { n: state.index + 1, total }) : t("qr.round", { n: state.index + 1 })}</span>
          {state.daily && <span className="rounded-lg bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30">{t("qr.dailyTag", { n: state.daily.n })}</span>}
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          {state.mode === "survival" && (
            <span className="flex items-center gap-1" aria-label={t("qr.lives", { n: state.lives })}>
              {Array.from({ length: SURVIVAL_LIVES }, (_, i) => (
                <Heart key={i} className={`size-5 ${i < state.lives ? "fill-rose-500 text-rose-500" : "text-slate-700"}`} />
              ))}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs font-semibold">
            <Flame className={`size-4 ${state.streak > 0 ? "text-amber-400" : "text-slate-600"}`} />
            {state.streak > 0 ? t("qr.streak", { n: state.streak, mult: mult.toFixed(1) }) : t("qr.noStreak")}
          </span>
          <span className="font-display text-lg font-bold tabular-nums text-cyan-300">{t("qr.pts", { n: state.score.toLocaleString("en-US") })}</span>
        </div>
      </div>

      {state.mode === "classic" && (
        <div className="flex gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < state.history.length ? (state.history[i] ? "bg-emerald-400" : "bg-rose-500") : i === state.index ? "bg-cyan-400" : "bg-white/10"}`} />
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-white/[0.08] bg-ink-850 p-5 sm:p-7">
        <RoundTimer running={!feedback} getLeftMs={getLeftMs} onTimeout={() => answer(null)} />

        <div className="my-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => play(q.hero)}
            aria-label={feedback ? t("qr.replayDone") : t("qr.replay")}
            className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-ink-950 shadow-[0_0_40px_-8px_rgb(6_182_212/0.8)] transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? <RotateCcw className="size-8" /> : <Play className="size-8 translate-x-0.5" />}
          </button>
          <Visualizer active={playing} height={36} />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{playing ? t("qr.playing") : t("qr.choose")}</p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {q.options.map((h) => {
            const isAnswer = h.slug === q.hero.slug;
            const picked = state.last?.pickedSlug === h.slug;
            const tone = !feedback
              ? "border-white/10 bg-white/[0.03] hover:border-cyan-400/50 hover:bg-cyan-400/[0.06]"
              : isAnswer
                ? "border-emerald-400/70 bg-emerald-400/10"
                : picked
                  ? "border-rose-400/70 bg-rose-500/10"
                  : "border-white/[0.06] bg-white/[0.02] opacity-50";
            return (
              <motion.button
                key={h.slug}
                type="button"
                disabled={feedback}
                onClick={() => answer(h.slug)}
                whileHover={feedback ? undefined : { scale: 1.02 }}
                whileTap={feedback ? undefined : { scale: 0.97 }}
                animate={feedback && picked && !isAnswer ? { x: [0, -6, 6, -4, 4, 0] } : feedback && isAnswer ? { scale: [1, 1.04, 1] } : undefined}
                transition={{ duration: 0.35 }}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${tone}`}
              >
                <HeroAvatar hero={h} className="size-12" />
                <span className="min-w-0 flex-1 truncate font-display text-lg font-bold text-white">{h.name}</span>
                {feedback && isAnswer && <Check className="size-5 text-emerald-400" />}
                {feedback && picked && !isAnswer && <X className="size-5 text-rose-400" />}
              </motion.button>
            );
          })}
        </div>

        {feedback && state.last && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-3" aria-live="polite">
            <div className={`rounded-2xl border px-4 py-3 ${state.last.correct ? "border-emerald-400/30 bg-emerald-400/[0.07]" : "border-rose-400/30 bg-rose-500/[0.07]"}`}>
              <p className={`font-display text-xl font-bold ${state.last.correct ? "text-emerald-300" : "text-rose-300"}`}>
                {state.last.correct ? t("qr.correct", { n: state.last.points?.total ?? 0 }) : state.last.timedOut ? t("qr.timeout", { name: q.hero.name }) : t("qr.wrong", { name: q.hero.name })}
              </p>
              {state.last.points && <p className="text-xs text-slate-400">{t("qr.breakdown", { base: state.last.points.base, speed: state.last.points.speed, mult: state.last.points.multiplier.toFixed(1) })}</p>}
              <p className="mt-1.5 text-sm italic text-slate-300">
                <span className="not-italic text-slate-500">{t("qr.quoteOf", { name: q.hero.name })}</span> “{q.hero.quote}”
              </p>
            </div>
            <motion.button type="button" autoFocus onClick={onNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-bold text-ink-950">
              {final ? t("qr.seeResults") : t("qr.next")}
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
