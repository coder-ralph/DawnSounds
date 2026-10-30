import { CLASSIC_ROUNDS, SURVIVAL_LIVES, pointsFor, type Points } from "@/lib/quiz";
import type { QuizMode } from "@/types";

export type { QuizQuestion as Question } from "@/lib/quiz";
import type { QuizQuestion as Question } from "@/lib/quiz";

export interface Answered {
  pickedSlug: string | null;
  correct: boolean;
  timedOut: boolean;
  points: Points | null;
}

export interface QuizState {
  mode: QuizMode;
  ign: string;
  /** Set for the Daily Challenge (Classic): which puzzle this is. */
  daily: { n: number; day: string } | null;
  questions: Question[];
  index: number;
  score: number;
  streak: number;
  bestStreak: number;
  correct: number;
  lives: number;
  /** one entry per answered round, in order (true = correct) — feeds the share grid */
  history: boolean[];
  phase: "question" | "feedback";
  last: Answered | null;
}

export type Action = { type: "answer"; pickedSlug: string | null; timeLeftMs: number } | { type: "next" };

export function initQuiz(mode: QuizMode, ign: string, questions: Question[], daily: QuizState["daily"] = null): QuizState {
  return {
    mode,
    ign,
    daily,
    questions,
    index: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    lives: mode === "survival" ? SURVIVAL_LIVES : 0,
    history: [],
    phase: "question",
    last: null,
  };
}

export const totalRounds = (s: QuizState) => (s.mode === "classic" ? Math.min(CLASSIC_ROUNDS, s.questions.length) : s.questions.length);

/** The game ends after the answer currently on screen (feedback phase) — no further rounds. */
export function isFinal(s: QuizState): boolean {
  if (s.phase !== "feedback") return false;
  if (s.mode === "survival" && s.lives <= 0) return true;
  return s.index + 1 >= totalRounds(s);
}

export function reducer(s: QuizState, a: Action): QuizState {
  if (a.type === "answer") {
    if (s.phase !== "question") return s;
    const q = s.questions[s.index];
    const timedOut = a.pickedSlug === null;
    const correct = !timedOut && a.pickedSlug === q.hero.slug;
    const points = correct ? pointsFor(a.timeLeftMs, s.streak) : null;
    const streak = correct ? s.streak + 1 : 0;
    return {
      ...s,
      phase: "feedback",
      score: s.score + (points?.total ?? 0),
      streak,
      bestStreak: Math.max(s.bestStreak, streak),
      correct: s.correct + (correct ? 1 : 0),
      lives: s.mode === "survival" && !correct ? s.lives - 1 : s.lives,
      history: [...s.history, correct],
      last: { pickedSlug: a.pickedSlug, correct, timedOut, points },
    };
  }
  if (s.phase !== "feedback" || isFinal(s)) return s;
  return { ...s, index: s.index + 1, phase: "question", last: null };
}

export const accuracyOf = (correct: number, answered: number) => (answered > 0 ? Math.round((correct / answered) * 100) : 0);
