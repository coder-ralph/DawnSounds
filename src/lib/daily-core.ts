// Pure helpers for the Daily Challenge (no imports → unit-testable in plain Node).

/**
 * Day of Daily #1 in the original numbered sequence: every Daily set is generated from its day (see dailySeedDay).
 * Also the start day given to profiles that existed before per-nickname profiles, so their numbers did not change.
 * A new nickname counts from its own first Daily instead and so starts at #1.
 */
export const DAILY_EPOCH = "2026-10-30";

const pad = (n: number) => String(n).padStart(2, "0");

/** The player's LOCAL calendar day, e.g. "2026-10-30". The Daily resets at their local midnight. */
export function localDayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const utcMs = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

export function addDays(key: string, delta: number): string {
  const t = new Date(utcMs(key) + delta * 86_400_000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** 1-based puzzle number for a day key. */
export function dailyNumber(key: string, epoch: string = DAILY_EPOCH): number {
  return Math.max(1, Math.round((utcMs(key) - utcMs(epoch)) / 86_400_000) + 1);
}

/** Milliseconds until the player's next local midnight. */
export function msUntilNextDay(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(0, next.getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

// ─── Daily streak (consecutive days with a completed Daily) ───
export interface StreakMeta {
  streak: number;
  best: number;
  lastDay: string | null;
}

/** Completing the Daily on `today`. Same day twice is a no-op; yesterday → +1; any gap → back to 1. */
export function nextStreak(meta: StreakMeta, today: string): StreakMeta {
  if (meta.lastDay === today) return meta;
  const streak = meta.lastDay === addDays(today, -1) ? meta.streak + 1 : 1;
  return { streak, best: Math.max(meta.best, streak), lastDay: today };
}

/** Streak to display right now: still alive if played today or yesterday, otherwise 0. */
export function liveStreak(meta: StreakMeta, today: string): number {
  return meta.lastDay === today || meta.lastDay === addDays(today, -1) ? meta.streak : 0;
}

// ─── Seeded RNG: same seed → same "random" sequence on every device ───
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export function seededRng(seed: string): () => number {
  let a = xmur3(seed)();
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Player profiles: every nickname has its own Daily history ───

/**
 * Canonical form of a nickname, used to tell players apart: Unicode-normalised (full-width letters fold to plain ones),
 * invisible/control characters removed, whitespace collapsed, lower-cased. "All  Under Heaven " and "all under heaven" are
 * the same player — the leaderboard treats IGNs case-insensitively too (unique index on lower(ign)).
 */
export function normalizeIgn(ign: string): string {
  return ign
    .normalize("NFKC")
    .replace(/[\p{Cc}\p{Cf}]/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Storage-safe id of a nickname's profile ("" when there is nothing to key on). URL-encoding keeps it one-to-one. */
export const profileKey = (ign: string): string => encodeURIComponent(normalizeIgn(ign));

/**
 * The calendar day whose question set is Daily #`n`. The sets have always been generated from the day they first ran on
 * (Daily #1 = DAILY_EPOCH), so "Daily #n" is the same ten rounds for every player who reaches it, whenever they get there.
 */
export const dailySeedDay = (n: number): string => addDays(DAILY_EPOCH, Math.max(1, Math.floor(n)) - 1);
