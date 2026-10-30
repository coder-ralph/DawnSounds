"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Cloud, Database, Heart, Map as MapIcon, Music2, Sparkles, Volume2, Zap, type LucideIcon } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useT } from "@/components/LanguageProvider";
import { HEROES } from "@/lib/heroes";
import type { DictKey } from "@/lib/i18n";
import type { TabId } from "@/types";

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
  { key: "about.roadR3", status: "soon" },
  { key: "about.roadR4", status: "idea" },
  { key: "about.roadR5", status: "idea" },
];
const STATUS_STYLE = { shipped: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30", soon: "bg-cyan-400/10 text-cyan-300 ring-cyan-400/30", idea: "bg-white/[0.05] text-slate-400 ring-white/10" } as const;
const STATUS_KEY = { shipped: "about.roadShipped", soon: "about.roadSoon", idea: "about.roadIdea" } as const;

export function AboutPage() {
  const t = useT();
  const router = useRouter();
  // On /about no tab is highlighted; clicking one goes to the app with that tab selected.
  const go = (id: TabId) => router.push(`/#${id}`);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header tab={null} onTab={go} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
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

          <Section icon={Database} title={t("about.methodTitle")} accent="bg-violet-400/10 text-violet-300 ring-violet-400/30">
            {(["about.methodP1", "about.methodP2", "about.methodP3", "about.methodP4"] as const).map((k) => (
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
      </main>
      <Footer />
    </div>
  );
}
