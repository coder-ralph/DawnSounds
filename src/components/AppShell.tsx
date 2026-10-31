"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Leaderboard } from "@/components/Leaderboard";
import { useT } from "@/components/LanguageProvider";
import { Quiz, type QuizActivity } from "@/components/quiz/Quiz";
import { QuitModal } from "@/components/QuitModal";
import { Soundboard } from "@/components/Soundboard";
import { useSoundboardFilters } from "@/components/useSoundboardFilters";
import { tabFromHash } from "@/lib/tabs";
import type { TabId } from "@/types";

type Dest = TabId | "about";

export function AppShell() {
  const router = useRouter();
  const t = useT();
  const [tab, setTab] = useState<TabId>("soundboard");
  const [activity, setActivity] = useState<QuizActivity>({ active: false, daily: false });
  const [pending, setPending] = useState<Dest | null>(null);
  const activeRef = useRef(false);
  activeRef.current = activity.active;
  const tabRef = useRef(tab);
  tabRef.current = tab;
  // Filters live here (not in <Soundboard>) so they survive tab switches; the URL carries them on the Soundboard tab.
  const filters = useSoundboardFilters(tab === "soundboard");
  const { hrefFor } = filters; // stable identity

  // Read the tab from the URL hash after hydration but before paint (the server HTML can't know the hash).
  useLayoutEffect(() => {
    setTab(tabFromHash(window.location.hash));
    // popstate covers Back/Forward (a traversal between entries that differ in their query string does NOT
    // fire hashchange); hashchange covers a hand-edited #hash. The handler is idempotent.
    const onNav = () => {
      const next = tabFromHash(window.location.hash);
      if (next === tabRef.current) return;
      if (activeRef.current) {
        // Browser back/forward during a game: put the current tab back on top of the history and ask first.
        history.pushState(null, "", hrefFor(tabRef.current));
        setPending(next);
        return;
      }
      setTab(next);
    };
    window.addEventListener("popstate", onNav);
    window.addEventListener("hashchange", onNav);
    return () => {
      window.removeEventListener("popstate", onNav);
      window.removeEventListener("hashchange", onNav);
    };
  }, [hrefFor]);

  useEffect(() => {
    document.title = `${t(tab === "soundboard" ? "nav.soundboard" : tab === "quiz" ? "nav.quiz" : "nav.ranks")} · DawnSounds`;
  }, [tab, t]);

  // Refresh / close / navigate away during a game → native confirmation.
  useEffect(() => {
    if (!activity.active) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Changes you made may not be saved.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [activity.active]);

  const go = useCallback((dest: Dest) => {
    if (dest === "about") return router.push("/about");
    setTab(dest);
    // pushState (not replaceState): every tab change is a history entry, so Back / Forward move between tabs.
    if (window.location.hash !== `#${dest}`) history.pushState(null, "", hrefFor(dest));
    window.scrollTo({ top: 0 });
  }, [router, hrefFor]);

  const request = useCallback(
    (dest: Dest) => {
      if (dest === tabRef.current) return;
      if (activeRef.current && dest !== "quiz") setPending(dest);
      else go(dest);
    },
    [go],
  );

  const onActivity = useCallback((a: QuizActivity) => setActivity((p) => (p.active === a.active && p.daily === a.daily ? p : a)), []);

  const confirmQuit = () => {
    const dest = pending;
    setPending(null);
    setActivity({ active: false, daily: false });
    activeRef.current = false;
    if (dest) go(dest);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header tab={tab} onTab={request} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <AnimatePresence mode="wait">
          {tab === "soundboard" && <Soundboard key="soundboard" filters={filters} />}
          {tab === "quiz" && <Quiz key="quiz" onActivityChange={onActivity} onRanks={() => request("ranks")} />}
          {tab === "ranks" && <Leaderboard key="ranks" onPlay={() => request("quiz")} />}
        </AnimatePresence>
      </main>
      <Footer
        onAbout={(e) => {
          if (activeRef.current) {
            e.preventDefault();
            setPending("about");
          }
        }}
      />
      <AnimatePresence>{pending && <QuitModal daily={activity.daily} onCancel={() => setPending(null)} onConfirm={confirmQuit} />}</AnimatePresence>
    </div>
  );
}
