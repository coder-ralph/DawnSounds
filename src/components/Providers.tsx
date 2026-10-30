"use client";

import { MotionConfig } from "framer-motion";
import { AudioProvider } from "@/components/AudioProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ToastProvider } from "@/components/Toast";

/** App-wide providers. Lives in the root layout so / and /about share language, audio and toasts. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <ToastProvider>
          <AudioProvider>
            {children}
            <ScrollToTop />
          </AudioProvider>
        </ToastProvider>
      </LanguageProvider>
    </MotionConfig>
  );
}
