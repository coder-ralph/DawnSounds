"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useT } from "@/components/LanguageProvider";

const SHOW_AFTER_PX = 480;

/** Floating "back to top" button, bottom-right. Appears once the page has been scrolled down. */
export function ScrollToTop() {
  const t = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="scroll-top"
          type="button"
          onClick={toTop}
          aria-label={t("scroll.top")}
          title={t("scroll.top")}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-[5.5rem] right-4 z-40 grid size-11 place-items-center rounded-xl border border-cyan-400/30 bg-ink-800/90 text-cyan-300 shadow-[0_10px_30px_-10px_rgb(6_182_212/0.55)] backdrop-blur transition-colors hover:border-cyan-400/60 hover:bg-ink-700 sm:bottom-6 sm:right-6"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
