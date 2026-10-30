"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useT } from "@/components/LanguageProvider";
import { MOONTON_URL, SITE } from "@/lib/constants";

/**
 * `onAbout` lets the host intercept the About link (e.g. to show the quit-quiz confirmation
 * when a game is in progress). Without it the link navigates normally.
 */
export function Footer({ onAbout }: { onAbout?: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
  const t = useT();
  return (
    <footer className="mt-16 border-t border-white/[0.06] bg-ink-950/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Link
            href="/about"
            onClick={onAbout}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3.5 py-1.5 text-sm font-semibold text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
          >
            <Info className="size-4" />
            {t("footer.about")}
          </Link>
          <div className="space-y-1 text-xs leading-relaxed text-gray-500">
            <p>{t("footer.line1")}</p>
            <p>
              {t("footer.line2a")}{" "}
              <a href={MOONTON_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-400 underline decoration-gray-600 underline-offset-2 transition-colors hover:text-cyan-300">
                Moonton Games
              </a>
              {t("footer.line2b")}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-gray-400">© 2026 MLBB Soundboard &amp; Audio Quiz. All rights reserved.</p>
          <a href={SITE.authorUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition-colors">
            <span>Made with ☕ by</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image/avatar.png" alt="Ralph Rosael" width={18} height={18} className="rounded-full" />
            <span className="group-hover:decoration-blue-500 underline decoration-gray-400 decoration-wavy underline-offset-[4px]">Ralph Rosael</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
