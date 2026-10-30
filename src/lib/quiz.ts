import { shuffle } from "@/lib/heroes";
import type { Hero } from "@/types";

export const ROUND_SECONDS = 15;
export const CLASSIC_ROUNDS = 10;
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

export function pointsFor(timeLeftMs: number, streakBefore: number): Points {
  const frac = Math.max(0, Math.min(1, timeLeftMs / (ROUND_SECONDS * 1000)));
  const speed = Math.round(SPEED_BONUS_MAX * frac);
  const multiplier = streakMultiplier(streakBefore);
  return { base: BASE_POINTS, speed, multiplier, total: Math.round((BASE_POINTS + speed) * multiplier) };
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
