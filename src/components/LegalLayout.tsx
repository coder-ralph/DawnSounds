"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { useLang } from "@/components/LanguageProvider";

export const LEGAL_UPDATED = "November 6, 2026";

/** Shared layout for the policy pages. The text itself is English-only on purpose (a translation of legal wording is easy to get subtly wrong); a note says so when another language is selected. */
export function LegalLayout({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  const { lang, t } = useLang();
  return (
    <PageShell width="max-w-3xl">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-display text-4xl font-bold uppercase tracking-wider text-white sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">{t("legal.updated", { date: LEGAL_UPDATED })}</p>
        {lang !== "en" && <p className="mt-2 text-sm text-amber-300/90">{t("legal.enOnly")}</p>}
        <p className="mt-4 text-lg text-slate-400">{intro}</p>
      </motion.header>
      <div className="mt-8 space-y-4">{children}</div>
      <p className="mt-8 text-sm text-slate-500">
        <Link href="/privacy" className="underline decoration-slate-700 underline-offset-2 hover:text-cyan-300">Privacy</Link> · <Link href="/terms" className="underline decoration-slate-700 underline-offset-2 hover:text-cyan-300">Terms</Link> ·{" "}
        <Link href="/about" className="underline decoration-slate-700 underline-offset-2 hover:text-cyan-300">About</Link>
      </p>
    </PageShell>
  );
}

export function LegalSection({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.3 }} className="rounded-2xl border border-white/[0.07] bg-ink-850/80 p-5 sm:p-6">
      <h2 className="flex items-baseline gap-3 font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
        <span className="text-amber-400/80 tabular-nums">{String(n).padStart(2, "0")}</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-400 [&_a]:font-semibold [&_a]:text-cyan-300 [&_a]:underline [&_a]:decoration-cyan-300/40 [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-white/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-cyan-300 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-slate-200 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </motion.section>
  );
}
