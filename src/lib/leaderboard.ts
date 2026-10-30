import { STORAGE_KEYS } from "@/lib/constants";
import { readJSON, removeKey, writeJSON } from "@/lib/storage";
import { getSupabase, supabaseConfigured, timeoutSignal } from "@/lib/supabase";
import type { QuizMode, ScoreEntry } from "@/types";

const MAX_ENTRIES = 100;

const sortScores = (a: ScoreEntry, b: ScoreEntry) =>
  b.score - a.score || b.accuracy - a.accuracy || (b.bestStreak ?? 0) - (a.bestStreak ?? 0) || a.date.localeCompare(b.date);

const isEntry = (e: unknown): e is ScoreEntry => {
  const x = e as ScoreEntry;
  return !!x && typeof x.id === "string" && typeof x.ign === "string" && typeof x.score === "number" && (x.mode === "classic" || x.mode === "survival");
};

export function loadScores(): ScoreEntry[] {
  const raw = readJSON<unknown>(STORAGE_KEYS.scores, []);
  return Array.isArray(raw) ? raw.filter(isEntry).sort(sortScores) : [];
}

/** Saves a finished game and returns where it landed (1-based) among entries of the same mode. */
export function saveScore(entry: ScoreEntry): { rank: number; total: number; isBest: boolean } {
  const all = loadScores();
  const prevBest = Math.max(0, ...all.filter((e) => e.mode === entry.mode && e.ign.toLowerCase() === entry.ign.toLowerCase()).map((e) => e.score));
  const next = [...all, entry].sort(sortScores).slice(0, MAX_ENTRIES);
  writeJSON(STORAGE_KEYS.scores, next);
  const sameMode = next.filter((e) => e.mode === entry.mode);
  const idx = sameMode.findIndex((e) => e.id === entry.id);
  return { rank: idx === -1 ? sameMode.length + 1 : idx + 1, total: sameMode.length, isBest: entry.score > prevBest };
}

export function clearScores() {
  removeKey(STORAGE_KEYS.scores);
}

// ───────────────────────── Global (Supabase) leaderboard ─────────────────────────

export type SubmitAction = "inserted" | "updated" | "kept" | "skipped" | "local";

export interface SubmitOutcome {
  /** where the score ended up */
  source: "global" | "local";
  action: SubmitAction;
  rank: number;
  total: number;
  /** true when this run is the player's new best (new IGN or higher score) */
  isBest: boolean;
  /** the player's stored best after this submit (global) or this run (local) */
  best: number;
  /** stored best before this submit, if any */
  previous: number | null;
  /** set when the global save failed and we fell back to this device */
  error?: string;
}

// The database stores the mode names registered in `leaderboard_modes` ("Classic", "Survival", ...).
// A new quiz mode needs: a row there, an entry here, and a tab in fetchGlobalScores.
const dbMode = (m: QuizMode) => (m === "classic" ? "Classic" : "Survival");
const appMode = (m: string): QuizMode => (m === "Classic" ? "classic" : "survival");

interface Row {
  id: string;
  ign: string;
  score: number;
  mode: string;
  accuracy: number | string;
  created_at: string;
  correct?: number | null;
  total?: number | null;
  best_streak?: number | null;
}

const rowToEntry = (r: Row): ScoreEntry => ({
  id: r.id,
  ign: r.ign,
  mode: appMode(r.mode),
  score: r.score,
  accuracy: Math.round(Number(r.accuracy)),
  date: r.created_at,
  ...(r.correct != null && r.total != null ? { correct: r.correct, total: r.total } : {}),
  ...(r.best_streak != null ? { bestStreak: r.best_streak } : {}),
});

/** Top scores per mode (one row per player per mode), merged. Throws if the request fails. */
export async function fetchGlobalScores(perMode = 50): Promise<ScoreEntry[]> {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase is not configured");
  const q = (mode: string) =>
    sb
      .from("leaderboard")
      .select("*")
      .eq("mode", mode)
      .order("score", { ascending: false })
      .order("accuracy", { ascending: false })
      .limit(perMode)
      .abortSignal(timeoutSignal() as AbortSignal);
  const [classic, survival] = await Promise.all([q("Classic"), q("Survival")]);
  if (classic.error) throw classic.error;
  if (survival.error) throw survival.error;
  return [...(classic.data as Row[]), ...(survival.data as Row[])].map(rowToEntry).sort(sortScores);
}

function localOutcome(entry: ScoreEntry, error?: string): SubmitOutcome {
  const r = saveScore(entry);
  return { source: "local", action: "local", rank: r.rank, total: r.total, isBest: r.isBest, best: entry.score, previous: null, error };
}

/**
 * Saves a finished game.
 *  - Supabase configured: atomic server-side upsert via the `submit_score` RPC
 *    (new IGN → insert, higher score → update, lower/equal → keep personal best).
 *  - Not configured, or the request fails: falls back to this device's localStorage.
 */
export async function submitScore(entry: ScoreEntry): Promise<SubmitOutcome> {
  const sb = getSupabase();
  if (!sb) return localOutcome(entry);
  if (entry.score <= 0) return { source: "global", action: "skipped", rank: 0, total: 0, isBest: false, best: 0, previous: null };

  try {
    const { data, error } = await sb
      .rpc("submit_score", {
        p_ign: entry.ign,
        p_mode: dbMode(entry.mode),
        p_score: entry.score,
        p_accuracy: entry.accuracy,
        p_correct: entry.correct ?? null,
        p_total: entry.total ?? null,
        p_best_streak: entry.bestStreak ?? null,
      })
      .abortSignal(timeoutSignal() as AbortSignal);
    if (error) throw error;
    const d = data as { action: "inserted" | "updated" | "kept"; score: number; previous_score: number | null; rank: number; total: number };
    return {
      source: "global",
      action: d.action,
      rank: d.rank,
      total: d.total,
      isBest: d.action !== "kept",
      best: d.score,
      previous: d.previous_score,
    };
  } catch (e) {
    return localOutcome(entry, e instanceof Error ? e.message : "Network error");
  }
}

export const modeKey = (m: QuizMode) => (m === "classic" ? "lb.classic" : "lb.survival") as "lb.classic" | "lb.survival";

export { supabaseConfigured };
