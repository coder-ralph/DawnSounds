"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Languages } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { LANGS } from "@/lib/i18n";

/** Globe button + dropdown. English default, Tagalog and 简体中文 for the interface only. */
export function LanguageMenu() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LANGS.find((l) => l.code === lang)!;

  return (
    <div ref={wrap} className="relative">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("lang.label")}: ${current.label}`}
        title={t("lang.label")}
        className={`grid size-9 place-items-center rounded-lg border transition-colors ${
          open ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-slate-400 hover:text-white"
        }`}
      >
        <Languages className="size-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={t("lang.label")}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-11 z-50 w-64 origin-top-right rounded-2xl border border-white/10 bg-ink-850 p-1.5 shadow-[0_24px_60px_-16px_rgb(0_0_0/0.85)]"
          >
            {LANGS.map((l) => {
              const active = l.code === lang;
              return (
                <button
                  key={l.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  lang={l.html}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                    button.current?.focus();
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    active ? "bg-cyan-400/10 text-cyan-300" : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span>{l.label}</span>
                  {active ? <Check className="size-4" /> : <span className="text-[11px] font-bold text-slate-500">{l.short}</span>}
                </button>
              );
            })}
            <p className="mt-1 border-t border-white/[0.06] px-3 pb-2 pt-2.5 text-[11px] leading-relaxed text-slate-500">{t("lang.note")}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
