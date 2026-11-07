import { boardCeilings, boardId, careerRating, type BadgeTier, badgeFor } from "@/lib/quiz";
import type { QuizMode, ScoreEntry } from "@/types";

/** One player's career across every board. */
export interface Career {
  /** lower-cased, trimmed IGN: the identity the database also uses (one row per lower(ign) and mode) */
  key: string;
  /** the IGN as the player typed it on their highest-scoring board */
  ign: string;
  rating: number;
  /** total of the best score on each board */
  points: number;
  /** how many of the 7 boards the player has a score on */
  boards: number;
  bestStreak: number;
  /** the best badge among the player's board bests, with the board it came from (the badge tooltip names it) */
  badge: { tier: BadgeTier; mode: QuizMode; total: number | null } | null;
  /** most recent submission */
  date: string;
}

const BADGE_ORDER: BadgeTier[] = ["savage", "godlike", "mythic"];

/**
 * Collapses score rows into one career per player (IGN, case-insensitive). Each board counts once, at the player's best score on it, capped
 * at that board's theoretical maximum (the server already rejects anything higher; this just keeps a legacy or hand-edited local row from
 * distorting the sum). Sorted by Rating, then boards played, then best streak, then the earlier first appearance.
 */
export function buildCareers(entries: ScoreEntry[], heroes = 133): Career[] {
  const ceilings = boardCeilings(heroes);
  const byPlayer = new Map<string, ScoreEntry[]>();
  for (const e of entries) {
    const key = e.ign.trim().toLowerCase();
    if (!key) continue;
    const list = byPlayer.get(key);
    if (list) list.push(e);
    else byPlayer.set(key, [e]);
  }

  const careers: Career[] = [];
  for (const [key, rows] of byPlayer) {
    const best = new Map<string, ScoreEntry>();
    for (const e of rows) {
      const id = boardId(e);
      const prev = best.get(id);
      if (!prev || e.score > prev.score) best.set(id, e);
    }
    let points = 0;
    let top: ScoreEntry = rows[0];
    let badge: Career["badge"] = null;
    let streak = 0;
    for (const [id, e] of best) {
      points += Math.min(Math.max(0, e.score), ceilings[id] ?? 0);
      if (e.score > top.score) top = e;
      const b = badgeFor(e, heroes);
      if (b && (!badge || BADGE_ORDER.indexOf(b) > BADGE_ORDER.indexOf(badge.tier))) badge = { tier: b, mode: e.mode, total: e.total ?? null };
      streak = Math.max(streak, e.bestStreak ?? 0);
    }
    careers.push({
      key,
      ign: top.ign.trim(),
      rating: careerRating(points, heroes),
      points,
      boards: best.size,
      bestStreak: streak,
      badge,
      date: rows.reduce((d, e) => (e.date > d ? e.date : d), ""),
    });
  }
  return careers.sort((a, b) => b.rating - a.rating || b.boards - a.boards || b.bestStreak - a.bestStreak || a.date.localeCompare(b.date) || a.key.localeCompare(b.key));
}
