"use client";

import { useEffect, useRef, useState } from "react";
import { ROUND_SECONDS } from "@/lib/quiz";
import { useT } from "@/components/LanguageProvider";

/** Countdown bar. `getLeftMs` is the single source of truth (the round's clock lives in QuizRound). */
export function RoundTimer({ running, getLeftMs, onTimeout }: { running: boolean; getLeftMs: () => number; onTimeout: () => void }) {
  const t = useT();
  const [left, setLeft] = useState(ROUND_SECONDS * 1000);
  const timeoutRef = useRef(onTimeout);
  timeoutRef.current = onTimeout;

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let fired = false;
    const tick = () => {
      const l = getLeftMs();
      setLeft(l);
      if (l <= 0) {
        if (!fired) {
          fired = true;
          timeoutRef.current();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, getLeftMs]);

  const frac = Math.max(0, Math.min(1, left / (ROUND_SECONDS * 1000)));
  const secs = Math.ceil(left / 1000);
  const tone = frac > 0.5 ? "from-cyan-400 to-blue-500" : frac > 0.25 ? "from-amber-300 to-amber-500" : "from-rose-400 to-rose-600";

  return (
    <div className="flex items-center gap-3" role="timer" aria-label={t("qr.secondsLeft", { n: secs })}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
        <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${frac * 100}%` }} />
      </div>
      <span className={`w-9 text-right font-display text-xl font-bold tabular-nums ${frac <= 0.25 ? "text-rose-400" : "text-slate-200"}`}>{secs}</span>
    </div>
  );
}
