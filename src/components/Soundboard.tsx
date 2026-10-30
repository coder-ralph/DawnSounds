"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownAZ, Dices, LayoutGrid, List, Search, SlidersHorizontal, X, Volume2 } from "lucide-react";
import { useAudio } from "@/components/AudioProvider";
import { FilterPanel } from "@/components/FilterPanel";
import { HeroCard } from "@/components/HeroCard";
import { useT } from "@/components/LanguageProvider";
import { useToast } from "@/components/Toast";
import { assetStats, assetsScanned } from "@/lib/assets";
import { STORAGE_KEYS } from "@/lib/constants";
import { filterHeroes, HEROES, type SortKey } from "@/lib/heroes";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Hero, Lane, Role } from "@/types";

export function Soundboard() {
  const t = useT();
  const toast = useToast();
  const { play, stop, playingSlug, usedFallback } = useAudio();

  const [query, setQuery] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const deferred = useDeferredValue(query);

  useEffect(() => {
    const v = readJSON<string>(STORAGE_KEYS.view, "grid");
    if (v === "grid" || v === "list") setView(v);
  }, []);
  const changeView = (v: "grid" | "list") => {
    setView(v);
    writeJSON(STORAGE_KEYS.view, v);
  };

  const list = useMemo(() => filterHeroes(HEROES, { query: deferred, roles, lanes }, sort), [deferred, roles, lanes, sort]);

  const onPlay = useCallback(
    async (h: Hero) => {
      if (playingSlug === h.slug) return stop();
      const r = await play(h);
      if (r === "blocked") toast("Your browser blocked audio — tap a card again to play.", "warn");
      else if (r === "unavailable") toast(`No audio or speech synthesis available for ${h.name}.`, "warn");
    },
    [play, stop, playingSlug, toast],
  );

  const random = () => {
    const pool = list.length ? list : HEROES;
    onPlay(pool[Math.floor(Math.random() * pool.length)]);
  };

  const reset = () => {
    setQuery("");
    setRoles([]);
    setLanes([]);
  };

  const active = roles.length + lanes.length;

  return (
    <section className="space-y-6">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.07] px-3 py-1 text-xs font-semibold text-cyan-300">
          <Volume2 className="size-3.5" />
          {assetsScanned && assetStats.withAudio > 0 ? t("sb.badge", { count: HEROES.length, clips: assetStats.withAudio }) : t("sb.badgeSpeech", { count: HEROES.length })}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide text-white sm:text-5xl">{t("sb.title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t.rich("sb.desc")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("sb.searchPh", { count: HEROES.length })}
            aria-label={t("sb.searchLabel")}
            className="w-full rounded-xl border border-white/10 bg-ink-850 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label={t("sb.clearSearch")} className="absolute right-2.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:text-white">
              <X className="size-4" />
            </button>
          )}
        </label>

        <button type="button" onClick={random} className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2.5 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-400/20">
          <Dices className="size-4" />
          {t("sb.random")}
        </button>

        <label className="relative">
          <ArrowDownAZ className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label={t("sb.sortLabel")} className="appearance-none rounded-xl border border-white/10 bg-ink-850 py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-200 focus:border-cyan-400/50 focus:outline-none">
            <option value="name">{t("sb.sortName")}</option>
            <option value="role">{t("sb.sortRole")}</option>
            <option value="lane">{t("sb.sortLane")}</option>
          </select>
        </label>

        <div role="group" aria-label={t("sb.viewMode")} className="flex rounded-xl border border-white/10 bg-ink-850 p-1">
          {(["grid", "list"] as const).map((v) => (
            <button key={v} type="button" onClick={() => changeView(v)} aria-pressed={view === v} aria-label={t(v === "grid" ? "sb.gridView" : "sb.listView")} className={`grid size-8 place-items-center rounded-lg transition-colors ${view === v ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}>
              {v === "grid" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters} className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors lg:hidden ${showFilters || active ? "border-cyan-400/40 text-cyan-300" : "border-white/10 text-slate-300"}`}>
          <SlidersHorizontal className="size-4" />
          {t("sb.filters")}
          {active > 0 && <span className="grid size-5 place-items-center rounded-full bg-cyan-400 text-[11px] font-bold text-ink-950">{active}</span>}
        </button>
      </div>

      <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
        <FilterPanel roles={roles} lanes={lanes} onRoles={setRoles} onLanes={setLanes} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
        <p>{t.rich("sb.showing", { shown: list.length, total: HEROES.length })}</p>
        {usedFallback && playingSlug && <p className="text-xs text-amber-300/80">{t("sb.fallbackNote")}</p>}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
          <p className="font-display text-2xl font-bold text-white">{t("sb.emptyTitle")}</p>
          <p className="mt-1 text-slate-400">{t("sb.emptyDesc")}</p>
          <button type="button" onClick={reset} className="mt-5 rounded-xl bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300 ring-1 ring-cyan-400/30 hover:bg-cyan-400/20">
            {t("sb.emptyReset")}
          </button>
        </div>
      ) : (
        <motion.div layout className={view === "grid" ? "grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-2"}>
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((h, i) => (
              <HeroCard key={h.slug} hero={h} index={i} view={view} playing={playingSlug === h.slug} onPlay={onPlay} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
