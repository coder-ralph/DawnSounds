"use client";

import { LogOut } from "lucide-react";
import { useT } from "@/components/LanguageProvider";

/** Top-right "Quit" control shown during an active run (all three modes). Opens the shared quit confirmation. */
export function QuitButton({ onClick }: { onClick: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("quit.btnAria")}
      title={t("quit.btnAria")}
      className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
    >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">{t("quit.btn")}</span>
    </button>
  );
}
