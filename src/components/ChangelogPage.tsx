"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Rocket, Sparkles, Star, Wrench, type LucideIcon } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useT } from "@/components/LanguageProvider";
import { CHANGELOG, type ChangeEntry, type ChangeType } from "@/data/changelog";

type Filter = "all" | ChangeType;
const COLLAPSED_ITEMS = 4;

/** Full class strings per type so Tailwind can see them. */
const TYPE = {
  major: { key: "cl.typeMajor", Icon: Star, dot: "bg-amber-300 shadow-[0_0_14px_2px_rgb(252_211_77/0.55)]", border: "border-amber-300/25 before:bg-gradient-to-r before:from-amber-300/0 before:via-amber-300 before:to-amber-300/0", tag: "bg-amber-300/10 text-amber-300 ring-amber-300/30", icon: "text-amber-300", chip: "text-amber-300 ring-amber-300/40 bg-amber-300/10" },
  feature: { key: "cl.typeFeature", Icon: Rocket, dot: "bg-cyan-400 shadow-[0_0_14px_2px_rgb(34_211_238/0.5)]", border: "border-cyan-400/25 before:bg-gradient-to-r before:from-cyan-400/0 before:via-cyan-400 before:to-cyan-400/0", tag: "bg-cyan-400/10 text-cyan-300 ring-cyan-400/30", icon: "text-cyan-300", chip: "text-cyan-300 ring-cyan-400/40 bg-cyan-400/10" },
  improvement: { key: "cl.typeImprovement", Icon: Wrench, dot: "bg-emerald-400 shadow-[0_0_14px_2px_rgb(52_211_153/0.5)]", border: "border-emerald-400/25 before:bg-gradient-to-r before:from-emerald-400/0 before:via-emerald-400 before:to-emerald-400/0", tag: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30", icon: "text-emerald-300", chip: "text-emerald-300 ring-emerald-400/40 bg-emerald-400/10" },
} as const satisfies Record<ChangeType, object>;

function Entry({ e, latest }: { e: ChangeEntry; latest: boolean }) {
  const t = useT();
  const s = TYPE[e.type];
  const [open, setOpen] = useState(false);
  const extra = e.items.length - COLLAPSED_ITEMS;
  const shown = open || extra <= 0 ? e.items : e.items.slice(0, COLLAPSED_ITEMS);
  const Icon: LucideIcon = e.concept ? Sparkles : s.Icon;

  return (
    <motion.li id={e.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.35 }} className="relative scroll-mt-24 pl-9 sm:pl-12">
      <span className={`absolute left-0 top-1.5 size-3.5 -translate-x-1/2 rounded-full ring-4 ring-ink-900 ${s.dot}`} aria-hidden />
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-ink-850 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">
          <Clock className="size-3.5 text-slate-500" aria-hidden />
          {e.date}
        </span>
        {latest && <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300 ring-1 ring-inset ring-emerald-400/30">{t("cl.latest")}</span>}
        {(e.prototype || e.concept) && <span className="rounded-md bg-white/[0.05] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 ring-1 ring-inset ring-white/10">{t(e.concept ? "cl.concept" : "cl.prototype")}</span>}
      </div>

      <article className={`relative overflow-hidden rounded-2xl border bg-ink-850/80 p-5 before:absolute before:inset-x-0 before:top-0 before:h-px sm:p-6 ${s.border}`}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <h2 className="flex items-center gap-2.5 font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
            <Icon className={`size-5 shrink-0 ${s.icon}`} aria-hidden />
            {e.title}
          </h2>
          <div className="flex items-center gap-1.5">
            <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset ${s.tag}`}>{t(s.key)}</span>
            {e.version && <span className="rounded bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-slate-300 ring-1 ring-inset ring-white/10">{e.version}</span>}
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {shown.map((it) => (
            <li key={it} className="flex items-start gap-2 text-[15px] leading-snug text-slate-400">
              <ChevronRight className={`mt-0.5 size-4 shrink-0 ${s.icon}`} aria-hidden />
              <span>{it}</span>
            </li>
          ))}
        </ul>
        {extra > 0 && (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`mt-3 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-inset transition-colors hover:brightness-125 ${s.chip}`}>
            {open ? t("cl.showLess") : t("cl.showMore", { n: extra })}
          </button>
        )}
      </article>
    </motion.li>
  );
}

export function ChangelogPage() {
  const t = useT();
  const [filter, setFilter] = useState<Filter>("all");
  const counts = useMemo(() => ({ all: CHANGELOG.length, major: CHANGELOG.filter((e) => e.type === "major").length, feature: CHANGELOG.filter((e) => e.type === "feature").length, improvement: CHANGELOG.filter((e) => e.type === "improvement").length }), []);
  const list = CHANGELOG.filter((e) => filter === "all" || e.type === filter);
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t("cl.filterAll") },
    { id: "major", label: t("cl.typeMajor") },
    { id: "feature", label: t("cl.typeFeature") },
    { id: "improvement", label: t("cl.typeImprovement") },
  ];

  return (
    <PageShell width="max-w-3xl">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-center">
        <h1 className="font-display text-4xl font-bold uppercase tracking-wider text-white sm:text-6xl">
          <span className="text-amber-400">{t("cl.title")}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-slate-400">{t("cl.tagline")}</p>
      </motion.header>

      <div role="group" aria-label={t("cl.filterAria")} className="mt-8 flex flex-wrap justify-center gap-2">
        {filters.map((f) => (
          <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-inset transition-colors ${filter === f.id ? "bg-amber-400/15 text-amber-300 ring-amber-400/50" : "text-slate-400 ring-white/10 hover:text-white"}`}>
            {f.label} <span className="ml-1 tabular-nums text-slate-500">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      <div className="relative mt-10 ml-1.5 sm:ml-2">
        <span className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-amber-300/60 via-white/10 to-white/5" aria-hidden />
        <ol className="space-y-9">
          {list.map((e) => (
            <Entry key={e.id} e={e} latest={e.id === CHANGELOG[0].id} />
          ))}
        </ol>
        <p className="relative mt-9 pl-9 text-xs font-bold uppercase tracking-[0.2em] text-slate-600 sm:pl-12">
          <span className="absolute left-0 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700 ring-4 ring-ink-900" aria-hidden />
          {t("cl.beginning")}
        </p>
      </div>
    </PageShell>
  );
}
