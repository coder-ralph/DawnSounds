"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Flame, Play, RotateCcw, X } from "lucide-react";
import { useAudio } from "@/components/AudioProvider";
import { useT } from "@/components/LanguageProvider";
import { QuitButton } from "@/components/quiz/QuitButton";
import { RoundTimer } from "@/components/quiz/RoundTimer";
import { categoryKey, isTriviaFinal, type TriviaState } from "@/components/quiz/triviaState";
import { Visualizer } from "@/components/Visualizer";
import { TRIVIA_SECONDS, streakMultiplier } from "@/lib/quiz";

const LETTERS = ["A", "B", "C", "D"] as const;
/** If the browser never reports the end of the utterance, start the clock anyway after this long. */
const READ_FAILSAFE_MS = 10_000;

export function TriviaRound({ state, onAnswer, onNext, onQuit, paused = false }: { state: TriviaState; onAnswer: (slot: number | null, timeLeftMs: number) => void; onNext: () => void; onQuit?: () => void; paused?: boolean }) {
  const t = useT();
  const { speak, stop, speaking } = useAudio();
  const round = state.rounds[state.index];
  const q = round.q;
  const feedback = state.phase === "feedback";
  const final = isTriviaFinal(state);
  const total = state.rounds.length;

  // The answer clock starts when the question has been read out (or immediately if there is no voice),
  // so a slow voice never costs the player time. Answering while it is still being read is allowed.
  const [ready, setReady] = useState(false);
  const startRef = useRef<number | null>(null);
  const answeredRef = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const markReady = useCallback(() => {
    if (startRef.current !== null || answeredRef.current || pausedRef.current) return;
    startRef.current = performance.now();
    setReady(true);
  }, []);
  const getLeftMs = useCallback(() => (startRef.current === null ? TRIVIA_SECONDS * 1000 : Math.max(0, TRIVIA_SECONDS * 1000 - (performance.now() - startRef.current))), []);

  const answer = useCallback(
    (slot: number | null) => {
      if (answeredRef.current) return;
      answeredRef.current = true;
      stop();
      onAnswer(slot, slot === null ? 0 : getLeftMs());
    },
    [getLeftMs, onAnswer, stop],
  );

  const failsafeRef = useRef(0);
  const read = useCallback(() => {
    window.clearTimeout(failsafeRef.current);
    failsafeRef.current = window.setTimeout(markReady, READ_FAILSAFE_MS);
    // "stopped" = interrupted by a replay / answer / unmount — the interrupter decides what happens next.
    speak(q.speechText).then((res) => {
      if (res !== "stopped") markReady();
    });
  }, [speak, q.speechText, markReady]);

  // Read the question when it mounts (the Start / Next click is the user gesture). Always silence on the way out:
  // unmount covers Next, quitting to the menu, switching tabs and leaving the page.
  useEffect(() => {
    read();
    return () => {
      window.clearTimeout(failsafeRef.current);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id]);

  // Quit dialog open: stop the voice and freeze the clock. On Cancel, give the time back; if the question
  // had not finished being read, read it again (the clock then starts after it, as usual).
  const pausedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (paused) {
      pausedAtRef.current = performance.now();
      window.clearTimeout(failsafeRef.current);
      stop();
    } else if (pausedAtRef.current !== null) {
      if (startRef.current !== null) startRef.current += performance.now() - pausedAtRef.current;
      pausedAtRef.current = null;
      if (startRef.current === null && !answeredRef.current) read();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // Keyboard: A–D or 1–4 picks an answer (ignored while the quit dialog is open).
  useEffect(() => {
    if (feedback) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector('[aria-modal="true"]')) return;
      const k = e.key.toUpperCase();
      const slot = LETTERS.indexOf(k as (typeof LETTERS)[number]);
      const n = Number(k) - 1;
      const pick = slot >= 0 ? slot : n >= 0 && n < 4 ? n : -1;
      if (pick >= 0) answer(pick);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedback, answer]);

  const mult = streakMultiplier(state.streak);
  const correctText = q.options[q.correctAnswer];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="mx-auto w-full max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 font-display text-base font-bold text-white">{t("qr.roundOf", { n: state.index + 1, total })}</span>
          <span className="rounded-lg bg-violet-400/10 px-2.5 py-1 text-xs font-bold text-violet-300 ring-1 ring-violet-400/30">{t(categoryKey(q.category))}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <span className="flex items-center gap-1 text-xs font-semibold">
            <Flame className={`size-4 ${state.streak > 0 ? "text-amber-400" : "text-slate-600"}`} />
            {state.streak > 0 ? t("qr.streak", { n: state.streak, mult: mult.toFixed(1) }) : t("qr.noStreak")}
          </span>
          <span className="font-display text-lg font-bold tabular-nums text-cyan-300">{t("qr.pts", { n: state.score.toLocaleString("en-US") })}</span>
          {onQuit && <QuitButton onClick={onQuit} />}
        </div>
      </div>

      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < state.history.length ? (state.history[i] ? "bg-emerald-400" : "bg-rose-500") : i === state.index ? "bg-violet-400" : "bg-white/10"}`} />
        ))}
      </div>

      <div className="rounded-3xl border border-white/[0.08] bg-ink-850 p-5 sm:p-7">
        <RoundTimer running={ready && !feedback && !paused} getLeftMs={getLeftMs} onTimeout={() => answer(null)} seconds={TRIVIA_SECONDS} />

        <div className="mt-6 flex items-start gap-4">
          <button
            type="button"
            onClick={read}
            aria-label={t("tr.replay")}
            className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-ink-950 shadow-[0_0_32px_-8px_rgb(168_85_247/0.8)] transition-transform hover:scale-105 active:scale-95"
          >
            {speaking ? <RotateCcw className="size-6" /> : <Play className="size-6 translate-x-0.5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {speaking ? t("tr.reading") : feedback ? t("tr.answered") : t("tr.choose")}
              <Visualizer active={speaking} height={14} bars={5} barClass="bg-violet-400" />
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold leading-snug text-white sm:text-[1.7rem]" aria-live="polite">
              {q.question}
            </h2>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2" role="group" aria-label={t("tr.optionsAria")}>
          {round.order.map((orig, slot) => {
            const isAnswer = slot === round.correctSlot;
            const picked = state.last?.pickedSlot === slot;
            const tone = !feedback
              ? "border-white/10 bg-white/[0.03] hover:border-violet-400/50 hover:bg-violet-400/[0.06]"
              : isAnswer
                ? "border-emerald-400/70 bg-emerald-400/10"
                : picked
                  ? "border-rose-400/70 bg-rose-500/10"
                  : "border-white/[0.06] bg-white/[0.02] opacity-50";
            return (
              <motion.button
                key={orig}
                type="button"
                disabled={feedback}
                onClick={() => answer(slot)}
                whileHover={feedback ? undefined : { scale: 1.02 }}
                whileTap={feedback ? undefined : { scale: 0.97 }}
                animate={feedback && picked && !isAnswer ? { x: [0, -6, 6, -4, 4, 0] } : feedback && isAnswer ? { scale: [1, 1.03, 1] } : undefined}
                transition={{ duration: 0.35 }}
                className={`flex min-h-16 items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${tone}`}
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-lg font-display text-lg font-bold ${feedback && isAnswer ? "bg-emerald-400 text-ink-950" : feedback && picked ? "bg-rose-500 text-white" : "bg-white/[0.08] text-slate-200"}`}>{LETTERS[slot]}</span>
                <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-white">{q.options[orig]}</span>
                {feedback && isAnswer && <Check className="size-5 shrink-0 text-emerald-400" />}
                {feedback && picked && !isAnswer && <X className="size-5 shrink-0 text-rose-400" />}
              </motion.button>
            );
          })}
        </div>

        {feedback && state.last && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-3" aria-live="polite">
            <div className={`rounded-2xl border px-4 py-3 ${state.last.correct ? "border-emerald-400/30 bg-emerald-400/[0.07]" : "border-rose-400/30 bg-rose-500/[0.07]"}`}>
              <p className={`font-display text-xl font-bold ${state.last.correct ? "text-emerald-300" : "text-rose-300"}`}>
                {state.last.correct ? t("qr.correct", { n: state.last.points?.total ?? 0 }) : state.last.timedOut ? t("tr.timeout", { answer: correctText }) : t("tr.wrong", { answer: correctText })}
              </p>
              {state.last.points && <p className="text-xs text-slate-400">{t("qr.breakdown", { base: state.last.points.base, speed: state.last.points.speed, mult: state.last.points.multiplier.toFixed(1) })}</p>}
            </div>
            <motion.button type="button" autoFocus onClick={onNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="w-full rounded-xl bg-gradient-to-r from-violet-400 to-fuchsia-500 px-4 py-3 font-bold text-ink-950">
              {final ? t("qr.seeResults") : t("tr.next")}
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
