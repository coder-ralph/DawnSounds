import { STORAGE_KEYS } from "@/lib/constants";
import { DAILY_EPOCH, dailyNumber, liveStreak, nextStreak, profileKey } from "@/lib/daily-core";
import { readJSON, removeKey, writeJSON } from "@/lib/storage";

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

/**
 * One player's Daily history. Every nickname has its own, stored under its own key (STORAGE_KEYS.dailyProfile + profileKey),
 * so switching nicknames on a shared device never touches anybody else's streak, number or "done today" state.
 */
interface Profile {
  /** nickname as last typed (display only: the storage key is the normalised form) */
  ign: string;
  /** local day of this nickname's first Daily; that day is its Daily #1 */
  startDay: string;
  streak: number;
  best: number;
  lastDay: string | null;
  /** the most recent COMPLETED daily */
  record: DailyRecord | null;
  /** the most recent daily that was STARTED (locks the attempt even if the player bails out) */
  started: { day: string } | null;
}

/** open = playable · done = completed today · used = started today but abandoned */
export type DailyStatus = "open" | "done" | "used";

export interface DailySnapshot {
  status: DailyStatus;
  record: DailyRecord | null;
  streak: number;
  best: number;
  /** number of today's Daily for this nickname (#1 for a nickname that has never played one) */
  n: number;
  /** no Daily history for this nickname on this device yet */
  isNew: boolean;
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const slot = (ign: string): string | null => {
  const k = profileKey(ign);
  return k ? STORAGE_KEYS.dailyProfile + k : null;
};

const freshProfile = (ign: string, startDay: string): Profile => ({ ign: ign.trim(), startDay, streak: 0, best: 0, lastDay: null, record: null, started: null });

function parseProfile(raw: unknown, ign: string): Profile | null {
  const r = raw as Partial<Profile> | null;
  if (!r || typeof r !== "object" || typeof r.startDay !== "string" || !DAY.test(r.startDay)) return null;
  return {
    ign: typeof r.ign === "string" && r.ign.trim() ? r.ign : ign.trim(),
    startDay: r.startDay,
    streak: Number(r.streak) || 0,
    best: Number(r.best) || 0,
    lastDay: typeof r.lastDay === "string" ? r.lastDay : null,
    record: r.record && typeof r.record.day === "string" ? r.record : null,
    started: r.started && typeof r.started.day === "string" ? { day: r.started.day } : null,
  };
}

function loadProfile(ign: string): Profile | null {
  migrateLegacy();
  const key = slot(ign);
  return key ? parseProfile(readJSON<unknown>(key, null), ign) : null;
}

function saveProfile(p: Profile): boolean {
  const key = slot(p.ign);
  return key ? writeJSON(key, p) : false;
}

// ─── Recent players (a short list, so switching back is one tap and a typo is easy to spot) ───
const MAX_RECENT = 6;

export function recentIgns(): string[] {
  migrateLegacy();
  const raw = readJSON<unknown>(STORAGE_KEYS.profiles, []);
  return Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string" && !!profileKey(s)).slice(0, MAX_RECENT) : [];
}

/** Moves a nickname to the front of the recent list. */
export function rememberIgn(ign: string) {
  const name = ign.trim();
  const k = profileKey(name);
  if (!k) return;
  writeJSON(STORAGE_KEYS.profiles, [name, ...recentIgns().filter((x) => profileKey(x) !== k)].slice(0, MAX_RECENT));
}

// ─── One-time migration of the old single-history key ───
let migrated = false;

/**
 * Before profiles, the whole browser shared ONE Daily history (STORAGE_KEYS.daily). Move it to the nickname that owns it
 * (the one that completed the last Daily, else the one that last started one) with the original numbering, so that player's
 * streak and Daily number are exactly what they were. A second nickname that had only started today's Daily keeps its lock.
 * Never overwrites an existing profile; the old key is deleted only once everything is safely written.
 */
function migrateLegacy() {
  if (migrated || typeof window === "undefined") return;
  migrated = true;
  const legacy = readJSON<{ streak?: unknown; best?: unknown; lastDay?: unknown; record?: Partial<DailyRecord> | null; started?: { day?: unknown; ign?: unknown } | null } | null>(STORAGE_KEYS.daily, null);
  if (!legacy || typeof legacy !== "object") return;

  const record = legacy.record && typeof legacy.record.day === "string" && typeof legacy.record.ign === "string" ? (legacy.record as DailyRecord) : null;
  const started = legacy.started && typeof legacy.started.day === "string" && typeof legacy.started.ign === "string" ? { day: legacy.started.day, ign: legacy.started.ign } : null;
  const owner = (record?.ign ?? started?.ign ?? readJSON<string>(STORAGE_KEYS.ign, "")).trim();

  let ok = true;
  const put = (p: Profile) => {
    const key = slot(p.ign);
    if (!key) return;
    if (readJSON<unknown>(key, null) === null) ok = writeJSON(key, p) && ok;
    rememberIgn(p.ign);
  };

  if (owner && slot(owner)) {
    put({
      ...freshProfile(owner, DAILY_EPOCH),
      streak: Number(legacy.streak) || 0,
      best: Number(legacy.best) || 0,
      lastDay: typeof legacy.lastDay === "string" ? legacy.lastDay : null,
      record,
      started: started && profileKey(started.ign) === profileKey(owner) ? { day: started.day } : null,
    });
  }
  if (started && profileKey(started.ign) !== profileKey(owner) && slot(started.ign)) {
    put({ ...freshProfile(started.ign, DAILY_EPOCH), started: { day: started.day } });
  }
  if (ok) removeKey(STORAGE_KEYS.daily);
}

// ─── Public API: every call names the nickname ───

export function readDaily(ign: string, today: string): DailySnapshot {
  const p = loadProfile(ign);
  const done = p?.record?.day === today;
  const used = !done && p?.started?.day === today;
  return {
    status: done ? "done" : used ? "used" : "open",
    record: done && p ? p.record : null,
    streak: p ? liveStreak(p, today) : 0,
    best: p?.best ?? 0,
    n: dailyNumber(today, p?.startDay ?? today),
    isNew: !p,
  };
}

/** Called the moment a Daily begins: from here on today's attempt is spent. Creates the profile on its first Daily. */
export function markDailyStarted(ign: string, today: string) {
  const p = loadProfile(ign) ?? freshProfile(ign, today);
  saveProfile({ ...p, ign: ign.trim(), started: { day: today } });
}

/** Called when the 10th round is answered (the record carries the nickname). Returns the updated streak. */
export function completeDaily(record: DailyRecord): { streak: number; best: number } {
  const p = loadProfile(record.ign) ?? freshProfile(record.ign, record.day);
  const next = nextStreak(p, record.day);
  saveProfile({ ...p, ...next, record });
  return { streak: next.streak, best: next.best };
}
