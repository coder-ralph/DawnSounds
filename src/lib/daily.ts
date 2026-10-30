import { STORAGE_KEYS } from "@/lib/constants";
import { liveStreak, nextStreak } from "@/lib/daily-core";
import { readJSON, writeJSON } from "@/lib/storage";

export interface DailyRecord {
  day: string;
  n: number;
  ign: string;
  score: number;
  correct: number;
  total: number;
  accuracy: number;
  bestStreak: number;
  /** one entry per round: true = correct */
  grid: boolean[];
}

interface DailyStore {
  streak: number;
  best: number;
  lastDay: string | null;
  /** the most recent COMPLETED daily */
  record: DailyRecord | null;
  /** the most recent daily that was STARTED (locks the attempt even if the player bails out) */
  started: { day: string; ign: string } | null;
}

const EMPTY: DailyStore = { streak: 0, best: 0, lastDay: null, record: null, started: null };

/** open = playable · done = completed today · used = started today but abandoned */
export type DailyStatus = "open" | "done" | "used";

export interface DailySnapshot {
  status: DailyStatus;
  record: DailyRecord | null;
  streak: number;
  best: number;
}

function load(): DailyStore {
  const raw = readJSON<Partial<DailyStore> | null>(STORAGE_KEYS.daily, null);
  if (!raw || typeof raw !== "object") return { ...EMPTY };
  return {
    streak: Number(raw.streak) || 0,
    best: Number(raw.best) || 0,
    lastDay: typeof raw.lastDay === "string" ? raw.lastDay : null,
    record: raw.record && typeof raw.record.day === "string" ? raw.record : null,
    started: raw.started && typeof raw.started.day === "string" ? raw.started : null,
  };
}

export function readDaily(today: string): DailySnapshot {
  const s = load();
  const done = s.record?.day === today;
  const used = !done && s.started?.day === today;
  return {
    status: done ? "done" : used ? "used" : "open",
    record: done ? s.record : null,
    streak: liveStreak(s, today),
    best: s.best,
  };
}

/** Called the moment a Daily begins: from here on today's attempt is spent. */
export function markDailyStarted(today: string, ign: string) {
  writeJSON(STORAGE_KEYS.daily, { ...load(), started: { day: today, ign } });
}

/** Called when the 10th round is answered. Returns the updated streak. */
export function completeDaily(record: DailyRecord): { streak: number; best: number } {
  const s = load();
  const next = nextStreak(s, record.day);
  writeJSON(STORAGE_KEYS.daily, { ...s, ...next, record });
  return { streak: next.streak, best: next.best };
}
