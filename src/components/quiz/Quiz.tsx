"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useLang } from "@/components/LanguageProvider";
import { QuizIntro } from "@/components/quiz/QuizIntro";
import { QuizResult, type ResultData } from "@/components/quiz/QuizResult";
import { QuizRound } from "@/components/quiz/QuizRound";
import { accuracyOf, initQuiz, isFinal, reducer, type Action, type QuizState } from "@/components/quiz/state";
import { useToast } from "@/components/Toast";
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
  const [result, setResult] = useState<ResultData | null>(null);
  const [showResult, setShowResult] = useState(false);
  const finalized = useRef<unknown>(null);

  const dispatch = useCallback((a: Action) => setGame((g) => (g ? reducer(g, a) : g)), []);

  // Tell the shell whether leaving now would lose progress.
  const active = !!game && !showResult && !isFinal(game);
  const isDaily = !!game?.daily;
  useEffect(() => {
    onActivityChange({ active, daily: active && isDaily });
  }, [active, isDaily, onActivityChange]);
  useEffect(() => () => onActivityChange({ active: false, daily: false }), [onActivityChange]);

  const start = (mode: QuizMode, ign: string) => {
    setResult(null);
    setShowResult(false);
    finalized.current = null;
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
    submitScore(entry).then((outcome) => {
      setResult((r) => (r && r.score === entry.score && r.ign === entry.ign ? { ...r, outcome } : r));
      if (outcome.error) toast(t("toast.offline"), "warn");
      else if (outcome.action === "kept") toast(outcome.best === entry.score ? t("toast.matched") : t("toast.kept"), "info");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  const viewDaily = () => {
    const snap = readDaily(localDayKey());
    if (snap.status !== "done" || !snap.record) return;
    const r = snap.record;
    setGame(null);
    setResult({ mode: "classic", ign: r.ign, score: r.score, correct: r.correct, total: r.total, accuracy: r.accuracy, bestStreak: r.bestStreak, history: r.grid, daily: { n: r.n, streak: snap.streak, bestStreak: snap.best }, outcome: null, noOutcome: true });
    setShowResult(true);
  };

  const menu = () => {
    setGame(null);
    setResult(null);
    setShowResult(false);
  };

  const again = () => result && start(result.mode, result.ign);

  const final = !!game && isFinal(game);

  return (
    <AnimatePresence mode="wait">
      {showResult && result ? (
        <QuizResult key="result" data={result} onAgain={again} onRanks={onRanks} onMenu={menu} />
      ) : game ? (
        <QuizRound key={`round-${game.index}`} state={game} onAnswer={(slug, timeLeftMs) => dispatch({ type: "answer", pickedSlug: slug, timeLeftMs })} onNext={() => (final ? setShowResult(true) : dispatch({ type: "next" }))} />
      ) : (
        <QuizIntro key="intro" onStart={start} onViewDaily={viewDaily} poolSize={pool.length} totalHeroes={HEROES.length} speechFallback={usingSpeechFallback} />
      )}
    </AnimatePresence>
  );
}
