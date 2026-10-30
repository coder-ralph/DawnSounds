"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert } from "lucide-react";

type Tone = "info" | "success" | "warn";
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

const Ctx = createContext<{ toast: (message: string, tone?: Tone) => void } | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.toast;
}

const ICON = { info: Info, success: CheckCircle2, warn: TriangleAlert };
const TONE = { info: "text-cyan-300", success: "text-emerald-300", warn: "text-amber-300" };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const toast = useCallback((message: string, tone: Tone = "info") => {
    const id = nextId.current++;
    setItems((s) => [...s.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => {
            const Icon = ICON[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-xl border border-white/10 bg-ink-800/95 px-4 py-2.5 text-sm text-slate-200 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur"
              >
                <Icon className={`size-4 shrink-0 ${TONE[t.tone]}`} />
                {t.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
