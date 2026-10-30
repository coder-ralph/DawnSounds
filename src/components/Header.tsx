"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Trophy, Volume2, VolumeX, Zap } from "lucide-react";
import { useAudio } from "@/components/AudioProvider";
import { LanguageMenu } from "@/components/LanguageMenu";
import { useT } from "@/components/LanguageProvider";
import type { TabId } from "@/types";

const TABS: { id: TabId; key: "nav.soundboard" | "nav.quiz" | "nav.ranks"; icon: typeof Volume2; pill: string }[] = [
  { id: "soundboard", key: "nav.soundboard", icon: Volume2, pill: "bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_6px_22px_-6px_rgb(245_158_11/0.7)]" },
  { id: "quiz", key: "nav.quiz", icon: Zap, pill: "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_6px_22px_-6px_rgb(6_182_212/0.7)]" },
  { id: "ranks", key: "nav.ranks", icon: Trophy, pill: "bg-gradient-to-b from-violet-400 to-violet-600 shadow-[0_6px_22px_-6px_rgb(139_92_246/0.7)]" },
];

/** `tab` is null on pages that aren't one of the three tabs (e.g. /about): nothing is highlighted. */
export function Header({ tab, onTab }: { tab: TabId | null; onTab: (t: TabId) => void }) {
  const { muted, volume, toggleMuted, setVolume } = useAudio();
  const t = useT();

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-1.5 px-4 sm:h-[72px] sm:gap-3 sm:px-6">
        <button type="button" onClick={() => onTab("soundboard")} className="group flex shrink-0 items-center gap-2 sm:gap-3" aria-label={t("nav.home")}>
          <motion.span whileHover={{ rotate: 12, scale: 1.06 }} className="relative flex size-10 overflow-hidden rounded-xl shadow-[0_0_24px_-4px_rgb(6_182_212/0.5)]">
            <Image 
              src="/image/logo.png" 
              alt="DawnSounds Logo" 
              fill
              sizes="(max-width: 768px) 40px, 40px"
              className="object-cover"
            />
          </motion.span>
          <span className="text-left leading-none">
            <span className="block font-display text-xl font-bold uppercase tracking-wider sm:text-2xl">
              <span className="text-amber-400">Dawn</span>
              <span className="text-cyan-400">Sounds</span>
            </span>
            <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:block">{t("brand.tagline")}</span>
          </span>
        </button>

        <div className="flex items-center gap-1 sm:gap-3">
          <nav className="flex gap-0.5 rounded-2xl border border-white/[0.08] bg-ink-950/70 p-1 sm:gap-1" aria-label={t("nav.main")}>
            {TABS.map((tab_) => {
              const active = tab === tab_.id;
              const Icon = tab_.icon;
              const label = t(tab_.key);
              return (
                <button
                  key={tab_.id}
                  type="button"
                  onClick={() => onTab(tab_.id)}
                  aria-current={active ? "page" : undefined}
                  aria-label={label}
                  className="relative flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold sm:px-4"
                >
                  {active && <motion.span layoutId="nav-pill" className={`absolute inset-0 rounded-xl ${tab_.pill}`} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className={`relative flex items-center gap-2 transition-colors ${active ? (tab_.id === "ranks" ? "text-white" : "text-ink-950") : "text-slate-400 hover:text-slate-100"}`}>
                    <Icon className="size-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button type="button" onClick={toggleMuted} aria-label={muted ? t("audio.unmute") : t("audio.mute")} className="grid size-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:text-white">
              {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label={t("audio.volume")}
              className="h-1 w-20 cursor-pointer accent-cyan-400"
            />
          </div>

          <LanguageMenu />
        </div>
      </div>
    </header>
  );
}
