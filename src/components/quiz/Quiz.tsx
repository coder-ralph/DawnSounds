"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useLang } from "@/components/LanguageProvider";
import { QuizIntro } from "@/components/quiz/QuizIntro";
import { QuizResult, type ResultData } from "@/components/quiz/QuizResult";
import { QuizRound } from "@/components/quiz/QuizRound";
import { accuracyOf, initQuiz, isFinal, reducer, type Action, type QuizState } from "@/components/quiz/state";
import { TriviaRound } from "@/components/quiz/TriviaRound";
import { initTrivia, isTriviaFinal, triviaReducer, type TriviaAction, type TriviaState } from "@/components/quiz/triviaState";
import { QuitModal } from "@/components/QuitModal";
import { useToast } from "@/components/Toast";
import { TRIVIA_CATEGORIES } from "@/data/triviaQuestions";
import { quizPool } from "@/lib/assets";
import { completeDaily, markDailyStarted, readDaily } from "@/lib/daily";
import { dailyNumber, localDayKey, seededRng } from "@/lib/daily-core";
import { HEROES } from "@/lib/heroes";
import { submitScore } from "@/lib/leaderboard";
import { buildQuestions, CLASSIC_ROUNDS } from "@/lib/quiz";
import type { QuizMode, ScoreEntry } from "@/types";

export interface QuizActivity {
  /** a game is in progress (the quit guard should protect it) */
  active: boolean;
  /** …and it's today's Daily Challenge (quitting spends the attempt) */
  daily: boolean;
}

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export function Quiz({ onActivityChange, onRanks }: { onActivityChange: (a: QuizActivity) => void; onRanks: () => void }) {
  const { t } = useLang();
  const toast = useToast();
  const { pool, usingSpeechFallback } = useMemo(() => quizPool(HEROES), []);

  const [game, setGame] = useState<QuizState | null>(null);
  const [trivia, setTrivia] = useState<TriviaState | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [showResult, setShowResult] = useState(false);
  // In-round "quit" button → confirmation dialog. The round clock is paused while it is open.
  const [quitOpen, setQuitOpen] = useState(false);
  const finalized = useRef<unknown>(null);

  const dispatch = useCallback((a: Action) => setGame((g) => (g ? reducer(g, a) : g)), []);
  const dispatchTrivia = useCallback((a: TriviaAction) => setTrivia((g) => (g ? triviaReducer(g, a) : g)), []);

  // Tell the shell whether leaving now would lose progress.
  const inRun = (!!game && !isFinal(game)) || (!!trivia && !isTriviaFinal(trivia));
  const active = inRun && !showResult;
  const isDaily = !!game?.daily;
  useEffect(() => {
    onActivityChange({ active, daily: active && isDaily });
  }, [active, isDaily, onActivityChange]);
  useEffect(() => () => onActivityChange({ active: false, daily: false }), [onActivityChange]);

  const start = (mode: QuizMode, ign: string) => {
    setResult(null);
    setShowResult(false);
    finalized.current = null;
    if (mode === "trivia") {
      setGame(null);
      setTrivia(initTrivia(ign));
      return;
    }
    setTrivia(null);
    if (mode === "classic") {
      const day = localDayKey();
      // Re-check at the moment of starting (another tab may have played, or midnight may have passed).
      if (readDaily(day).status !== "open") return;
      markDailyStarted(day, ign);
      const questions = buildQuestions(pool, CLASSIC_ROUNDS, seededRng(`dawnsounds:daily:${day}`));
      setGame(initQuiz("classic", ign, questions, { n: dailyNumber(day), day }));
    } else {
      setGame(initQuiz("survival", ign, buildQuestions(pool, pool.length)));
    }
  };

  const submit = (entry: ScoreEntry) =>
    submitScore(entry).then((outcome) => {
      setResult((r) => (r && r.score === entry.score && r.ign === entry.ign ? { ...r, outcome } : r));
      if (outcome.error) toast(t("toast.offline"), "warn");
      else if (outcome.action === "kept") toast(outcome.best === entry.score ? t("toast.matched") : t("toast.kept"), "info");
    });

  // The moment the last answer lands: record the Daily and submit the score. (Not on "See results", so a
  // refresh between the last answer and the results screen can't lose the run.)
  useEffect(() => {
    if (!game || !isFinal(game) || finalized.current === game.questions) return;
    finalized.current = game.questions;
    const answered = game.history.length;
    const accuracy = accuracyOf(game.correct, answered);

    let dailyMeta: ResultData["daily"] = null;
    if (game.daily) {
      const { streak, best } = completeDaily({ day: game.daily.day, n: game.daily.n, ign: game.ign, score: game.score, correct: game.correct, total: answered, accuracy, bestStreak: game.bestStreak, grid: game.history });
      dailyMeta = { n: game.daily.n, streak, bestStreak: best };
    }

    setResult({ mode: game.mode, ign: game.ign, score: game.score, correct: game.correct, total: answered, accuracy, bestStreak: game.bestStreak, history: game.history, daily: dailyMeta, outcome: null });

    if (game.score <= 0) return;
    const entry: ScoreEntry = { id: uid(), ign: game.ign, mode: game.mode, score: game.score, correct: game.correct, total: answered, accuracy, bestStreak: game.bestStreak, date: new Date().toISOString() };
    submit(entry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  // Trivia Arena: same moment (the last answer lands), same leaderboard pipeline, plus a per-category breakdown.
  useEffect(() => {
    if (!trivia || !isTriviaFinal(trivia) || finalized.current === trivia.rounds) return;
    finalized.current = trivia.rounds;
    const answered = trivia.history.length;
    const accuracy = accuracyOf(trivia.correct, answered);
    const breakdown = TRIVIA_CATEGORIES.map((category) => ({ category, ...trivia.tally[category] })).filter((b) => b.total > 0);
    setResult({ mode: "trivia", ign: trivia.ign, score: trivia.score, correct: trivia.correct, total: answered, accuracy, bestStreak: trivia.bestStreak, history: trivia.history, daily: null, outcome: null, breakdown });
    if (trivia.score <= 0) return;
    submit({ id: uid(), ign: trivia.ign, mode: "trivia", score: trivia.score, correct: trivia.correct, total: answered, accuracy, bestStreak: trivia.bestStreak, date: new Date().toISOString() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trivia]);

  const viewDaily = () => {
    const snap = readDaily(localDayKey());
    if (snap.status !== "done" || !snap.record) return;
    const r = snap.record;
    setGame(null);
    setResult({ mode: "classic", ign: r.ign, score: r.score, correct: r.correct, total: r.total, accuracy: r.accuracy, bestStreak: r.bestStreak, history: r.grid, daily: { n: r.n, streak: snap.streak, bestStreak: snap.best }, outcome: null, noOutcome: true });
    setShowResult(true);
  };

  const menu = () => {
    setQuitOpen(false);
    setGame(null);
    setTrivia(null);
    setResult(null);
    setShowResult(false);
  };

  const again = () => result && start(result.mode, result.ign);

  const final = (!!game && isFinal(game)) || (!!trivia && isTriviaFinal(trivia));
  // Nothing left to lose once the last answer is in (the score is already saved), so no quit button then.
  const onQuit = final ? undefined : () => setQuitOpen(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {showResult && result ? (
          <QuizResult key="result" data={result} onAgain={again} onRanks={onRanks} onMenu={menu} />
        ) : trivia ? (
          <TriviaRound key={`trivia-${trivia.index}`} state={trivia} paused={quitOpen} onQuit={onQuit} onAnswer={(slot, timeLeftMs) => dispatchTrivia({ type: "answer", slot, timeLeftMs })} onNext={() => (final ? setShowResult(true) : dispatchTrivia({ type: "next" }))} />
        ) : game ? (
          <QuizRound key={`round-${game.index}`} state={game} paused={quitOpen} onQuit={onQuit} onAnswer={(slug, timeLeftMs) => dispatch({ type: "answer", pickedSlug: slug, timeLeftMs })} onNext={() => (final ? setShowResult(true) : dispatch({ type: "next" }))} />
        ) : (
          <QuizIntro key="intro" onStart={start} onViewDaily={viewDaily} poolSize={pool.length} totalHeroes={HEROES.length} speechFallback={usingSpeechFallback} />
        )}
      </AnimatePresence>
      <AnimatePresence>{quitOpen && <QuitModal daily={isDaily} onCancel={() => setQuitOpen(false)} onConfirm={menu} />}</AnimatePresence>
    </>
  );
}
