"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Cloud, Database, Heart, Map as MapIcon, Music2, ShieldCheck, Sparkles, Volume2, Zap, type LucideIcon } from "lucide-react";
import { useT } from "@/components/LanguageProvider";
import { PageShell } from "@/components/PageShell";
import { RankBadge } from "@/components/RankBadge";
import { GAME_PATCH, REPORT_ISSUE_URL } from "@/lib/constants";
import { HEROES } from "@/lib/heroes";
import type { DictKey } from "@/lib/i18n";
import { BADGE_RULES, ROUND_SECONDS, SURVIVAL_LIVES, TRIVIA_LENGTHS, TRIVIA_LENGTH_MINS, TRIVIA_SECONDS, scoreCeiling, CLASSIC_ROUNDS, type BadgeTier, type TriviaLength } from "@/lib/quiz";

const fade = { initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-40px" }, transition: { duration: 0.35 } } as const;

function Section({ icon: Icon, title, accent, children }: { icon: LucideIcon; title: string; accent: string; children: React.ReactNode }) {
  return (
    <motion.section {...fade} className="rounded-2xl border border-white/[0.07] bg-ink-850/80 p-5 sm:p-7">
      <h2 className="flex items-center gap-3 font-display text-2xl font-bold uppercase tracking-wide text-white">
        <span className={`grid size-9 place-items-center rounded-xl ring-1 ring-inset ${accent}`}>
          <Icon className="size-5" />
        </span>
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-slate-400">{children}</div>
    </motion.section>
  );
}

const ROADMAP: { key: DictKey; status: "shipped" | "soon" | "idea" }[] = [
  { key: "about.roadR1", status: "shipped" },
  { key: "about.roadR2", status: "shipped" },
  { key: "about.roadR6", status: "shipped" },
  { key: "about.roadR3", status: "soon" },
  { key: "about.roadR7", status: "idea" },
  { key: "about.roadR8", status: "idea" },
  { key: "about.roadR4", status: "idea" },
  { key: "about.roadR5", status: "idea" },
];

/** Names and blurbs for the five Trivia run lengths (same wording as the length picker). */
const TIER_NAME = { 10: "qi.lenBlitz", 25: "qi.lenStandard", 50: "qi.lenEndurance", 75: "qi.lenMarathon", 100: "qi.lenLegend" } as const satisfies Record<TriviaLength, DictKey>;
const BADGE_ORDER: { tier: BadgeTier; text: DictKey }[] = [
  { tier: "savage", text: "guide.badgeSavage" },
  { tier: "godlike", text: "guide.badgeGodlike" },
  { tier: "mythic", text: "guide.badgeMythic" },
];
const fmt = (n: number) => n.toLocaleString("en-US");
const STATUS_STYLE = { shipped: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30", soon: "bg-cyan-400/10 text-cyan-300 ring-cyan-400/30", idea: "bg-white/[0.05] text-slate-400 ring-white/10" } as const;
const STATUS_KEY = { shipped: "about.roadShipped", soon: "about.roadSoon", idea: "about.roadIdea" } as const;

export function AboutPage() {
  const t = useT();

  return (
    <PageShell width="max-w-3xl">
      <>
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-center">
          <h1 className="font-display text-4xl font-bold uppercase tracking-wider text-white sm:text-6xl">
            <span className="text-amber-400">{t("about.title").split(" ")[0]}</span> <span className="text-cyan-400">{t("about.title").split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-400">{t("about.tagline")}</p>
        </motion.header>

        <div className="mt-10 space-y-5">
          <Section icon={Heart} title={t("about.whoTitle")} accent="bg-rose-400/10 text-rose-300 ring-rose-400/30">
            <p>{t("about.whoP1")}</p>
            <p>{t.rich("about.whoP2")}</p>
            <ul className="flex flex-wrap gap-2 pt-1">
              {(["about.chipSolo", "about.chipAds", "about.chipAudio", "about.chipBoards"] as const).map((k) => (
                <li key={k} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
                  {t(k)}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Volume2} title={t("about.whatTitle")} accent="bg-cyan-400/10 text-cyan-300 ring-cyan-400/30">
            <p>{t("about.whatIntro")}</p>
            <ul className="space-y-2.5">
              {(["about.whatB1", "about.whatB2", "about.whatB3", "about.whatB4"] as const).map((k) => (
                <li key={k} className="flex gap-3">
                  <Zap className="mt-1 size-4 shrink-0 text-amber-400" />
                  <span>{t.rich(k, { count: HEROES.length })}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Verification callout — one constant (GAME_PATCH) drives the patch number */}
          <motion.section {...fade} className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.04] p-5 sm:p-7">
            <h2 className="flex items-center gap-3 font-display text-2xl font-bold uppercase tracking-wide text-white">
              <ShieldCheck className="size-6 text-emerald-400" aria-hidden />
              {t("about.verifyTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-400">{t("about.verifyBody", { count: HEROES.length, patch: GAME_PATCH.version })}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-emerald-400">{t("about.verifyStamp", { count: HEROES.length, patch: GAME_PATCH.version })}</p>
            <p className="mt-2 text-sm text-slate-500">
              {t("about.verifyIssueA")}{" "}
              <a href={REPORT_ISSUE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-300 underline decoration-cyan-300/40 underline-offset-2">
                {t("about.verifyIssueB")}
              </a>
            </p>
          </motion.section>

          <Section icon={BookOpen} title={t("guide.title")} accent="bg-amber-400/10 text-amber-300 ring-amber-400/30">
            <p>{t("guide.intro")}</p>

            <h3 className="pt-2 font-display text-lg font-bold uppercase tracking-wide text-slate-200">{t("guide.modesTitle")}</h3>
            <ul className="grid gap-2.5 sm:grid-cols-3">
              {[
                { name: t("guide.classicName"), desc: t("guide.classicDesc", { sec: ROUND_SECONDS }), tone: "text-amber-300" },
                { name: t("guide.survivalName"), desc: t("guide.survivalDesc", { lives: SURVIVAL_LIVES, sec: ROUND_SECONDS }), tone: "text-cyan-300" },
                { name: t("guide.triviaName"), desc: t("guide.triviaDesc", { sec: TRIVIA_SECONDS }), tone: "text-violet-300" },
              ].map((m) => (
                <li key={m.name} className="rounded-xl border border-white/[0.06] bg-ink-950/40 p-3.5">
                  <p className={`font-display text-lg font-bold uppercase tracking-wide ${m.tone}`}>{m.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{m.desc}</p>
                </li>
              ))}
            </ul>

            <h3 className="pt-3 font-display text-lg font-bold uppercase tracking-wide text-slate-200">{t("guide.pointsTitle")}</h3>
            <p>{t.rich("guide.pointsP1")}</p>
            <p>{t.rich("guide.pointsP2")}</p>

            <h3 className="pt-3 font-display text-lg font-bold uppercase tracking-wide text-slate-200">{t("guide.tiersTitle")}</h3>
            <p>{t("guide.tiersDesc")}</p>
            <div className="overflow-hidden rounded-xl border border-white/[0.06]">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">{t("guide.maxTitle")}</caption>
                <thead className="bg-ink-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-3 py-2">{t("guide.colRun")}</th>
                    <th scope="col" className="px-3 py-2">{t("guide.colTime")}</th>
                    <th scope="col" className="px-3 py-2 text-right">{t("guide.maxTitle")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {TRIVIA_LENGTHS.map((n) => (
                    <tr key={n}>
                      <th scope="row" className="px-3 py-2 font-semibold text-slate-200">
                        {t(TIER_NAME[n])} <span className="font-normal text-slate-500">· {t("qi.lenQuestions", { n })}</span>
                      </th>
                      <td className="px-3 py-2 text-slate-400">{t("qi.lenMins", { m: TRIVIA_LENGTH_MINS[n] })}</td>
                      <td className="px-3 py-2 text-right font-display text-base font-bold tabular-nums text-violet-300">{fmt(scoreCeiling(n))}</td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="px-3 py-2 font-semibold text-slate-200">{t("guide.maxClassic", { n: CLASSIC_ROUNDS })}</th>
                    <td className="px-3 py-2 text-slate-600">—</td>
                    <td className="px-3 py-2 text-right font-display text-base font-bold tabular-nums text-amber-300">{fmt(scoreCeiling(CLASSIC_ROUNDS))}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-3 py-2 font-semibold text-slate-200">{t("guide.maxSurvival", { count: HEROES.length })}</th>
                    <td className="px-3 py-2 text-slate-600">—</td>
                    <td className="px-3 py-2 text-right font-display text-base font-bold tabular-nums text-cyan-300">{fmt(scoreCeiling(HEROES.length))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500">{t("guide.maxNote")}</p>

            <h3 className="pt-3 font-display text-lg font-bold uppercase tracking-wide text-slate-200">{t("guide.badgesTitle")}</h3>
            <p>{t("guide.badgesDesc")}</p>
            <ul className="space-y-2">
              {BADGE_ORDER.map(({ tier, text }) => (
                <li key={tier} className="flex flex-col items-start gap-x-3 gap-y-2 rounded-xl border border-white/[0.06] bg-ink-950/40 px-3.5 py-3 sm:flex-row sm:items-center">
                  <span className="shrink-0 sm:w-44">
                    <RankBadge tier={tier} mode="trivia" total={100} showTip={false} className="[&_span]:whitespace-nowrap" />
                  </span>
                  <span className="min-w-0 flex-1 text-slate-300">{t(text, { pct: Math.round(BADGE_RULES[tier].pct * 100) })}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500">{t("guide.badgesNote")}</p>
          </Section>

          <Section icon={Database} title={t("about.methodTitle")} accent="bg-violet-400/10 text-violet-300 ring-violet-400/30">
            {(["about.methodP1", "about.methodP2", "about.methodP5", "about.methodP3", "about.methodP4"] as const).map((k) => (
              <p key={k}>{t.rich(k)}</p>
            ))}
            <p className="flex items-center gap-2 pt-1 text-xs text-slate-500">
              <Cloud className="size-4" />
              Supabase · Next.js · Framer Motion
            </p>
          </Section>

          <Section icon={MapIcon} title={t("about.roadTitle")} accent="bg-amber-400/10 text-amber-300 ring-amber-400/30">
            <p>{t("about.roadIntro")}</p>
            <ul className="space-y-2">
              {ROADMAP.map((r) => (
                <li key={r.key} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-ink-950/40 px-3.5 py-3">
                  <span className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${STATUS_STYLE[r.status]}`}>{t(STATUS_KEY[r.status])}</span>
                  <span className="text-slate-300">{t(r.key)}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/#soundboard" className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-3 font-bold text-amber-300 transition-colors hover:bg-amber-400/20">
            <Music2 className="size-4" />
            {t("about.ctaSb")}
          </Link>
          <Link href="/#quiz" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-bold text-ink-950">
            <Sparkles className="size-4" />
            {t("about.ctaQuiz")}
          </Link>
        </div>
      </>
    </PageShell>
  );
}
