"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { HeroAvatar } from "@/components/HeroAvatar";
import { useT } from "@/components/LanguageProvider";
import { Visualizer } from "@/components/Visualizer";
import { ROLE_STYLE } from "@/lib/constants";
import type { Hero } from "@/types";

export const HeroCard = memo(function HeroCard({ hero, playing, onPlay, view, index }: { hero: Hero; playing: boolean; onPlay: (h: Hero) => void; view: "grid" | "list"; index: number }) {
  const t = useT();
  const style = ROLE_STYLE[hero.primaryRole];
  const label = playing ? t("card.stop", { name: hero.name }) : t("card.play", { name: hero.name });
  const roleText = hero.roles.map((r) => t(`role.${r}`)).join(" / ");

  const common = {
    type: "button" as const,
    onClick: () => onPlay(hero),
    "aria-label": label,
    "aria-pressed": playing,
  };

  const list = view === "list";
  return (
    <motion.button
      {...common}
      layout="position"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 14) * 0.025, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative w-full overflow-hidden rounded-2xl border text-left transition-colors ${
        playing ? "border-cyan-400/60 bg-cyan-400/[0.06] shadow-[0_0_32px_-10px_rgb(6_182_212/0.6)]" : "border-white/[0.07] bg-ink-850 hover:border-white/20"
      } ${list ? "flex items-center gap-4 p-3" : "flex flex-col gap-3 p-4"}`}
    >
      <div className={`flex items-center gap-3 ${list ? "min-w-0 flex-1" : ""}`}>
        <HeroAvatar hero={hero} className="size-14" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-lg font-bold leading-tight text-white">{hero.name}</div>
          <div className={`truncate text-xs font-semibold ${style.text}`}>{roleText}</div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500">{t(`lane.${hero.lane}`)}</div>
        </div>
        <span className={`grid size-9 shrink-0 place-items-center rounded-full ${playing ? "bg-cyan-400 text-ink-950" : "bg-white/[0.06] text-slate-300 group-hover:bg-white/10"}`}>
          {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
        </span>
      </div>
      {list ? (
        <p className="hidden min-w-0 flex-[1.4] truncate text-sm italic text-slate-400 md:block">“{hero.quote}”</p>
      ) : (
        <p className="line-clamp-2 min-h-[2.5rem] text-sm italic leading-snug text-slate-400">“{hero.quote}”</p>
      )}
      {playing && <Visualizer active height={list ? 24 : 28} bars={list ? 7 : 11} className={list ? "w-20 shrink-0" : "-mt-1"} />}
    </motion.button>
  );
});
