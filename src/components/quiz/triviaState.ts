import { TRIVIA_CATEGORIES, TRIVIA_QUESTIONS, type TriviaCategory, type TriviaQuestion } from "@/data/triviaQuestions";
import { shuffle } from "@/lib/heroes";
import { TRIVIA_ROUNDS, TRIVIA_SECONDS, pointsFor, type Points } from "@/lib/quiz";

/** One question as shown this run: options are shuffled, `order[slot]` is the authored index shown in that slot. */
export interface TriviaRoundQ {
  q: TriviaQuestion;
  order: number[];
  /** display slot (0–3 → A–D) holding the right answer */
  correctSlot: number;
}

export interface TriviaAnswered {
  /** display slot the player chose, or null on timeout */
  pickedSlot: number | null;
  correct: boolean;
  timedOut: boolean;
  points: Points | null;
}

export type CategoryTally = Record<TriviaCategory, { correct: number; total: number }>;

export interface TriviaState {
  ign: string;
  rounds: TriviaRoundQ[];
  index: number;
  score: number;
  streak: number;
  bestStreak: number;
  correct: number;
  history: boolean[];
  tally: CategoryTally;
  phase: "question" | "feedback";
  last: TriviaAnswered | null;
}

export type TriviaAction = { type: "answer"; slot: number | null; timeLeftMs: number } | { type: "next" };

const emptyTally = (): CategoryTally => Object.fromEntries(TRIVIA_CATEGORIES.map((c) => [c, { correct: 0, total: 0 }])) as CategoryTally;

/** `count` distinct questions from the bank, each with freshly shuffled options. */
export function buildTriviaRounds(count: number = TRIVIA_ROUNDS, bank: readonly TriviaQuestion[] = TRIVIA_QUESTIONS, rng: () => number = Math.random): TriviaRoundQ[] {
  return shuffle(bank, rng)
    .slice(0, count)
    .map((q) => {
      const order = shuffle([0, 1, 2, 3], rng);
      return { q, order, correctSlot: order.indexOf(q.correctAnswer) };
    });
}

export function initTrivia(ign: string, rounds: TriviaRoundQ[] = buildTriviaRounds()): TriviaState {
  return { ign, rounds, index: 0, score: 0, streak: 0, bestStreak: 0, correct: 0, history: [], tally: emptyTally(), phase: "question", last: null };
}

export const isTriviaFinal = (s: TriviaState) => s.phase === "feedback" && s.index + 1 >= s.rounds.length;

export function triviaReducer(s: TriviaState, a: TriviaAction): TriviaState {
  if (a.type === "answer") {
    if (s.phase !== "question") return s;
    const r = s.rounds[s.index];
    const timedOut = a.slot === null;
    const correct = !timedOut && a.slot === r.correctSlot;
    const points = correct ? pointsFor(a.timeLeftMs, s.streak, TRIVIA_SECONDS) : null;
    const streak = correct ? s.streak + 1 : 0;
    const cat = r.q.category;
    return {
      ...s,
      phase: "feedback",
      score: s.score + (points?.total ?? 0),
      streak,
      bestStreak: Math.max(s.bestStreak, streak),
      correct: s.correct + (correct ? 1 : 0),
      history: [...s.history, correct],
      tally: { ...s.tally, [cat]: { correct: s.tally[cat].correct + (correct ? 1 : 0), total: s.tally[cat].total + 1 } },
      last: { pickedSlot: a.slot, correct, timedOut, points },
    };
  }
  if (s.phase !== "feedback" || isTriviaFinal(s)) return s;
  return { ...s, index: s.index + 1, phase: "question", last: null };
}

/** i18n key for a category chip / result row. */
export const categoryKey = (c: TriviaCategory) =>
  ({ Counters: "tr.catCounters", "Items & Spells": "tr.catItems", "Hero Titles": "tr.catTitles", "Skills & Lore": "tr.catLore" })[c] as "tr.catCounters" | "tr.catItems" | "tr.catTitles" | "tr.catLore";
