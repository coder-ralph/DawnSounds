"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { IconImage } from "@/components/IconImage";
import { useT } from "@/components/LanguageProvider";
import { laneIconSrc, roleIconSrc } from "@/lib/assets";
import { LANES, ROLES, ROLE_STYLE } from "@/lib/constants";
import type { Lane, Role } from "@/types";

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function Pill({ active, onClick, children, activeClass }: { active: boolean; onClick: () => void; children: React.ReactNode; activeClass: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
        active ? activeClass : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-100"
      }`}
    >
      {children}
    </motion.button>
  );
}

export function FilterPanel({ roles, lanes, onRoles, onLanes }: { roles: Role[]; lanes: Lane[]; onRoles: (r: Role[]) => void; onLanes: (l: Lane[]) => void }) {
  const t = useT();
  const any = roles.length > 0 || lanes.length > 0;
  return (
    <div className="space-y-4 rounded-2xl border border-white/[0.07] bg-ink-850/80 p-4 sm:p-5">
      <div>
        <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{t("filter.role")}</h3>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => {
            const s = ROLE_STYLE[r.slug];
            return (
              <Pill key={r.slug} active={roles.includes(r.slug)} onClick={() => onRoles(toggle(roles, r.slug))} activeClass={`border-transparent ${s.bg} ${s.text} ring-1 ${s.ring}`}>
                <IconImage src={roleIconSrc(r.slug)} Fallback={r.icon} className="size-4" />
                {t(`role.${r.slug}`)}
              </Pill>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{t("filter.lane")}</h3>
        <div className="flex flex-wrap gap-2">
          {LANES.map((l) => (
            <Pill key={l.slug} active={lanes.includes(l.slug)} onClick={() => onLanes(toggle(lanes, l.slug))} activeClass="border-transparent bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/40">
              <IconImage src={laneIconSrc(l.slug)} Fallback={l.icon} className="size-4" />
              {t(`lane.${l.slug}`)}
            </Pill>
          ))}
        </div>
      </div>
      {any && (
        <button
          type="button"
          onClick={() => {
            onRoles([]);
            onLanes([]);
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
        >
          <X className="size-3.5" />
          {t("filter.clear")}
        </button>
      )}
    </div>
  );
}
