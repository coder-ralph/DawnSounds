"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCountdown, localDayKey, msUntilNextDay } from "@/lib/daily-core";
import { readDaily, type DailySnapshot } from "@/lib/daily";

export interface DailyView extends DailySnapshot {
  day: string;
  /** puzzle number of the next daily */
  nextN: number;
  countdown: string;
}

/**
 * Live view of today's Daily Challenge for ONE nickname (every nickname has its own number, streak and "done today" state).
 * null on the server / first render, and while `ign` is null (it depends on the player's clock and localStorage). Ticks every
 * second so the countdown runs and the card flips back to "open" the moment local midnight passes; changing `ign`
 * re-reads straight away, so the card never shows the previous nickname's state.
 */
export function useDaily(ign: string | null): DailyView | null {
  // null until mounted (storage and clock only exist in the browser); then a counter bumped every second.
  const [tick, setTick] = useState<number | null>(null);

  useEffect(() => {
    const bump = () => setTick((t) => (t ?? 0) + 1);
    bump();
    const id = window.setInterval(bump, 1000);
    const onVis = () => document.visibilityState === "visible" && bump();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return useMemo(() => {
    if (tick === null || ign === null) return null;
    const now = new Date();
    const day = localDayKey(now);
    const snap = readDaily(ign, day);
    return { ...snap, day, nextN: snap.n + 1, countdown: formatCountdown(msUntilNextDay(now)) };
    // `tick` is the clock: re-read every second so another tab's progress and midnight both show up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ign]);
}
