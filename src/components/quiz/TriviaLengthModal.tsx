"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Flame, Play, Timer, TriangleAlert } from "lucide-react";
import { useT } from "@/components/LanguageProvider";
import { TRIVIA_LENGTHS, TRIVIA_LENGTH_MINS, type TriviaLength } from "@/lib/quiz";

/** Name + one-line blurb for each length (full literal keys so the i18n types can check them). */
const TIER = {
  10: { name: "qi.lenBlitz", desc: "qi.lenBlitzDesc" },
  25: { name: "qi.lenStandard", desc: "qi.lenStandardDesc" },
  50: { name: "qi.lenEndurance", desc: "qi.lenEnduranceDesc" },
  75: { name: "qi.lenMarathon", desc: "qi.lenMarathonDesc" },
  100: { name: "qi.lenLegend", desc: "qi.lenLegendDesc" },
} as const;

/** From this length up, the picker warns that there is no pause/resume. */
const LONG_FROM = 75;

/**
 * "How many questions?" picker shown when the player presses Start Trivia: a pill selector, a detail card for the
 * highlighted length, then Launch Arena / Cancel. `max` = questions available in the bank (longer options are disabled).
 * Launching from here keeps the click that the browser needs before it will speak.
 */
export function TriviaLengthModal({ initial, max, onLaunch, onCancel }: { initial: TriviaLength; max: number; onLaunch: (length: TriviaLength) => void; onCancel: () => void }) {
  const t = useT();
  const [len, setLen] = useState<TriviaLength>(initial <= max ? initial : TRIVIA_LENGTHS[0]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Partial<Record<TriviaLength, HTMLButtonElement | null>>>({});

  // Focus the selected pill on open, and hand focus back to whatever opened the dialog.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    pillRefs.current[len]?.focus();
    return () => opener?.focus?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const available = TRIVIA_LENGTHS.filter((n) => n <= max);
  const move = (dir: 1 | -1) => {
    const i = available.indexOf(len);
    const next = available[(i + dir + available.length) % available.length];
    setLen(next);
    pillRefs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onCancel();
    } else if (e.key === "Tab") {
      // Focus trap: the selected pill (roving tabindex), Cancel, Launch.
      const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"])') ?? []);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const mins = TRIVIA_LENGTH_MINS[len];
  const long = len >= LONG_FROM;

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink-950/75 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
      onKeyDown={onKeyDown}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tlen-title"
        aria-describedby="tlen-desc"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.14, ease: "easeIn" } }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="my-auto w-full max-w-md rounded-3xl border border-white/[0.08] bg-ink-850 p-5 text-center shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] sm:p-7"
      >
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-400/10 ring-1 ring-violet-400/30">
          <Brain className="size-7 text-violet-300" />
        </div>
        <h2 id="tlen-title" className="mt-3 font-display text-2xl font-bold uppercase tracking-wide text-white">
          {t("qi.lenTitle")}
        </h2>
        <p id="tlen-desc" className="mt-1 text-sm text-slate-400">
          {t("qi.lenDesc")}
        </p>

        <div role="radiogroup" aria-label={t("qi.lenAria")} className="mt-5 grid grid-cols-5 gap-2" onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), move(1));
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), move(-1));
        }}>
          {TRIVIA_LENGTHS.map((n) => {
            const disabled = n > max;
            const on = n === len;
            return (
              <button
                key={n}
                ref={(el) => {
                  pillRefs.current[n] = el;
                }}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={t("qi.lenQuestions", { n })}
                disabled={disabled}
                tabIndex={on ? 0 : -1}
                onClick={() => setLen(n)}
                className={`relative flex min-h-14 flex-col items-center justify-center rounded-xl border px-1 py-2 font-display text-2xl font-bold leading-none tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                  on ? "border-violet-400/70 bg-violet-500/20 text-white shadow-[0_0_24px_-8px_rgb(168_85_247/0.9)]" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-violet-400/40 hover:text-white"
                }`}
              >
                {n}
                {n === 100 && <Flame className="mt-1 size-3.5 text-orange-400" aria-hidden />}
              </button>
            );
          })}
        </div>

        <div className={`mt-4 rounded-2xl border px-4 py-3.5 text-left ${long ? "border-amber-400/30 bg-amber-400/[0.05]" : "border-white/[0.07] bg-ink-950/60"}`} aria-live="polite">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-xl font-bold uppercase tracking-wide text-violet-200">{t(TIER[len].name)}</p>
            <p className="flex items-center gap-1 text-xs font-semibold text-slate-400">
              <Timer className="size-3.5" aria-hidden />
              {t("qi.lenMins", { m: mins })}
            </p>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-white">{t("qi.lenQuestions", { n: len })}</p>
          <p className="mt-1 text-sm text-slate-400">{t(TIER[len].desc)}</p>
          {long && (
            <p className="mt-2.5 flex items-start gap-1.5 text-xs text-amber-300/90">
              <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
              {t("qi.lenWarn")}
            </p>
          )}
        </div>

        <div className="mt-5 grid grid-cols-[auto_1fr] gap-2.5">
          <button type="button" onClick={onCancel} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-white/25 hover:text-white">
            {t("quit.cancel")}
          </button>
          <motion.button type="button" onClick={() => onLaunch(len)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-400 to-fuchsia-500 px-4 py-3 font-bold text-ink-950">
            <Play className="size-4" />
            {t("qi.lenLaunch")}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
