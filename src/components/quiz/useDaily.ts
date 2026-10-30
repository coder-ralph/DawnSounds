"use client";

import { useEffect, useState } from "react";
import { dailyNumber, formatCountdown, localDayKey, msUntilNextDay } from "@/lib/daily-core";
import { readDaily, type DailySnapshot } from "@/lib/daily";

export interface DailyView extends DailySnapshot {
  day: string;
  n: number;
  /** puzzle number of the next daily */
  nextN: number;
  countdown: string;
}

/**
 * Live view of today's Daily Challenge. null on the server / first render (it depends on the
 * player's clock and localStorage). Ticks every second so the countdown runs and the card
 * flips back to "open" the moment local midnight passes.
 */
export function useDaily(): DailyView | null {
  const [view, setView] = useState<DailyView | null>(null);

  useEffect(() => {
    const read = () => {
      const now = new Date();
      const day = localDayKey(now);
      const snap = readDaily(day);
      const n = dailyNumber(day);
      setView((prev) => {
        const next: DailyView = { ...snap, day, n, nextN: n + 1, countdown: formatCountdown(msUntilNextDay(now)) };
        return prev && prev.day === next.day && prev.status === next.status && prev.countdown === next.countdown && prev.streak === next.streak ? prev : next;
      });
    };
    read();
    const id = window.setInterval(read, 1000);
    const onVis = () => document.visibilityState === "visible" && read();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return view;
}
