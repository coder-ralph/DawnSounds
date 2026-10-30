"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { useT } from "@/components/LanguageProvider";

export function QuitModal({ onCancel, onConfirm, daily = false }: { onCancel: () => void; onConfirm: () => void; daily?: boolean }) {
  const t = useT();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Move focus into the dialog and hand it back to whatever opened it.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onCancel();
    } else if (e.key === "Tab") {
      // Two-button focus trap.
      const first = cancelRef.current;
      const last = confirmRef.current;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-950/75 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
      onKeyDown={onKeyDown}
    >
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="quit-title"
        aria-describedby="quit-desc"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.14, ease: "easeIn" } }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-ink-850 p-6 text-center shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] sm:p-8"
      >
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-400/10 ring-1 ring-amber-400/30">
          <TriangleAlert className="size-7 text-amber-400" />
        </div>
        <h2 id="quit-title" className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-white">
          {t("quit.title")}
        </h2>
        <p id="quit-desc" className="mt-2 text-[15px] leading-relaxed text-slate-400">
          {t("quit.desc")}
          {daily && <span className="mt-2 block text-[13px] text-amber-300/90">{t("quit.daily")}</span>}
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <motion.button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-bold text-ink-950"
          >
            {t("quit.cancel")}
          </motion.button>
          <motion.button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 font-bold text-rose-300 transition-colors hover:bg-rose-500/20"
          >
            {t("quit.confirm")}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
