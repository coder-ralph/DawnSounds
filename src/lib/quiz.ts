import { shuffle } from "@/lib/heroes";
import type { Hero, QuizMode } from "@/types";

export const ROUND_SECONDS = 15;
export const CLASSIC_ROUNDS = 10;
/** Trivia Arena: questions per run, and seconds to answer once the question has finished being read aloud. */
export const TRIVIA_ROUNDS = 10;
/**
 * Trivia run lengths the player can pick. Each length is its own leaderboard (DB mode "Trivia", "Trivia 25", …),
 * and the same numbers are registered in supabase/trivia-lengths.sql — add one in both places.
 * `mins` is a rough estimate (~15 s per question: read aloud + answer + feedback) shown on the picker.
 */
export const TRIVIA_LENGTHS = [10, 25, 50, 75, 100] as const;
export type TriviaLength = (typeof TRIVIA_LENGTHS)[number];
export const TRIVIA_LENGTH_MINS: Record<TriviaLength, number> = { 10: 2.5, 25: 6, 50: 12, 75: 18, 100: 25 };
export const isTriviaLength = (n: unknown): n is TriviaLength => (TRIVIA_LENGTHS as readonly unknown[]).includes(n);
/** Runs longer than this swap the one-segment-per-question progress strip for a continuous bar. */
export const PROGRESS_SEGMENTS_MAX = 30;
export const TRIVIA_SECONDS = 20;
export const SURVIVAL_LIVES = 3;
export const BASE_POINTS = 100;
export const SPEED_BONUS_MAX = 50;
export const MULTIPLIER_STEP = 0.1;
export const MULTIPLIER_CAP = 2;

/** `streakBefore` = correct answers in a row before this one. */
export const streakMultiplier = (streakBefore: number) =>
  Math.min(MULTIPLIER_CAP, 1 + MULTIPLIER_STEP * streakBefore);

export interface Points {
  base: number;
  speed: number;
  multiplier: number;
  total: number;
}

export function pointsFor(timeLeftMs: number, streakBefore: number, totalSeconds: number = ROUND_SECONDS): Points {
  const frac = Math.max(0, Math.min(1, timeLeftMs / (totalSeconds * 1000)));
  const speed = Math.round(SPEED_BONUS_MAX * frac);
  const multiplier = streakMultiplier(streakBefore);
  return { base: BASE_POINTS, speed, multiplier, total: Math.round((BASE_POINTS + speed) * multiplier) };
}

/**
 * Highest score possible with `correct` right answers (every one answered instantly, streak never broken).
 * Mirrors score_ceiling() in supabase/harden-submit-score.sql — keep the two in step with the constants above.
 *   c ≤ 10: 150·c + 15·c·(c−1)/2   (10 → 2,175)      c ≥ 10: 300·c − 825   (100 → 29,175 · 133 → 39,075)
 */
export const scoreCeiling = (correct: number) =>
  correct <= 0 ? 0 : correct <= 10 ? 150 * correct + (15 * correct * (correct - 1)) / 2 : 300 * correct - 825;

// ── Prestige badges: how close a run came to the real maximum for its length ──
export type BadgeTier = "savage" | "godlike" | "mythic";
/** Share of the maximum possible score (and, for the top tier, a flawless run) needed per tier. */
export const BADGE_RULES: Record<BadgeTier, { pct: number; flawless: boolean }> = {
  savage: { pct: 0.9, flawless: false },
  godlike: { pct: 0.95, flawless: false },
  mythic: { pct: 0.99, flawless: true },
};

/** Rounds in a run's theoretical maximum: Survival = a full run through the roster (`heroes`), Classic = 10, Trivia = the length played. */
export const roundsOf = (e: { mode: QuizMode; total?: number | null }, heroes = 133): number =>
  e.mode === "survival" ? heroes : e.mode === "classic" ? CLASSIC_ROUNDS : (e.total ?? TRIVIA_ROUNDS);

/** The career Rating's ceiling: reaching it takes a perfect, instant run on every board (Classic, Survival and all five Trivia lengths). */
export const RATING_MAX = 100_000;

/** Every board a player can post a best on, as an id (`classic`, `survival`, `trivia-10` … `trivia-100`) with its theoretical maximum score. */
export const boardId = (e: { mode: QuizMode; total?: number | null }): string =>
  e.mode === "trivia" ? `trivia-${isTriviaLength(e.total) ? e.total : TRIVIA_ROUNDS}` : e.mode;

export function boardCeilings(heroes = 133): Record<string, number> {
  return {
    classic: scoreCeiling(CLASSIC_ROUNDS),
    survival: scoreCeiling(heroes),
    ...Object.fromEntries(TRIVIA_LENGTHS.map((n) => [`trivia-${n}`, scoreCeiling(n)])),
  };
}

/** Sum of every board's ceiling (115,125 with 133 heroes): the total points a perfect career would hold. */
export const careerMax = (heroes = 133): number => Object.values(boardCeilings(heroes)).reduce((s, n) => s + n, 0);

/**
 * How fast the Rating climbs at first. The Rating is  100,000 · (1 − e^(−k·x)) / (1 − e^(−k))  with x = career points ÷ careerMax:
 * k = 2 puts a player with 15% of the points at ~29k and one with half at ~73k, then each further point is worth less and less
 * (the first 10% of points adds ~21k, the last 10% only ~3.5k). Raise it for a faster early climb, lower it for a flatter curve.
 */
export const CAREER_CURVE = 2;

/**
 * Career Rating, 0–100,000: a player's best scores summed over every board, run through a concave curve — it grows with each new
 * board played and each personal best, but with diminishing returns, so 100,000 (every board perfect) stays a long-term milestone.
 * Monotonic and capped, so a short run can never jump to the top the way a single-run percentage did.
 */
export function careerRating(points: number, heroes = 133): number {
  const max = careerMax(heroes);
  const x = Math.min(1, Math.max(0, points) / max);
  return Math.round((RATING_MAX * (1 - Math.exp(-CAREER_CURVE * x))) / (1 - Math.exp(-CAREER_CURVE)));
}

/**
 * Badge earned by a finished run, or null. Compared against the *theoretical* maximum for the run's length — never
 * against the database's max_score, which is only an outer guard and is far above anything reachable.
 * `heroes` = Survival's longest possible run (one question per hero). Rows without correct/total (old global rows) earn nothing.
 */
export function badgeFor(e: { mode: QuizMode; score: number; correct?: number | null; total?: number | null }, heroes = 133): BadgeTier | null {
  if (e.correct == null || e.total == null || e.total < 1) return null;
  const ceiling = scoreCeiling(roundsOf(e, heroes));
  if (ceiling <= 0) return null;
  const pct = e.score / ceiling;
  const flawless = e.correct === e.total;
  if (pct >= BADGE_RULES.mythic.pct && flawless) return "mythic";
  if (pct >= BADGE_RULES.godlike.pct) return "godlike";
  if (pct >= BADGE_RULES.savage.pct) return "savage";
  return null;
}

export const buildDeck = (pool: Hero[], rng: () => number = Math.random) => shuffle(pool, rng);

/** Answer + 3 distractors; two share the answer's role when possible so it isn't trivially easy. */
export function makeOptions(answer: Hero, all: Hero[], rng: () => number = Math.random): Hero[] {
  const others = all.filter((h) => h.slug !== answer.slug);
  const sameRole = shuffle(others.filter((h) => h.primaryRole === answer.primaryRole), rng).slice(0, 2);
  const used = new Set(sameRole.map((h) => h.slug));
  const rest = shuffle(others.filter((h) => !used.has(h.slug)), rng).slice(0, 3 - sameRole.length);
  return shuffle([answer, ...sameRole, ...rest], rng);
}

export interface QuizQuestion {
  hero: Hero;
  options: Hero[];
}

/** `count` rounds from `pool`. Pass a seeded `rng` and every player gets the same questions and options (Daily Challenge). */
export function buildQuestions(pool: Hero[], count: number, rng: () => number = Math.random): QuizQuestion[] {
  return buildDeck(pool, rng)
    .slice(0, count)
    .map((hero) => ({ hero, options: makeOptions(hero, pool, rng) }));
}
