"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/LanguageProvider";
import { FOOTER_LINKS, GAME_PATCH, MOONTON_URL, SITE, type FooterHref } from "@/lib/constants";

/** First year of publication. Server render and hydration both use this; the browser then swaps in the current year. */
const FIRST_YEAR = 2026;
const subscribe = () => () => {};
const currentYear = () => new Date().getFullYear();
const serverYear = () => FIRST_YEAR;

const base = "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60";

/**
 * Footer navigation: game patch chip (external) · About · Privacy · Terms · Changelog, then the fan-project disclaimer.
 * The link for the page you are on is highlighted and carries aria-current="page".
 * `onNavigate` lets the host intercept an internal link (the app shell uses it to show the quit-quiz confirmation
 * while a game is in progress). Without it the links navigate normally.
 */
export function Footer({ onNavigate }: { onNavigate?: (e: React.MouseEvent<HTMLAnchorElement>, href: FooterHref) => void }) {
  const t = useT();
  const pathname = usePathname() ?? "/";
  // useSyncExternalStore renders getServerSnapshot during SSR and hydration (so the markup matches, no mismatch error),
  // then re-renders with the browser's real year. A page built last year therefore never keeps a stale year.
  const year = useSyncExternalStore(subscribe, currentYear, serverYear);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <footer className="mt-16 border-t border-white/[0.06] bg-ink-950/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <nav aria-label={t("footer.nav")} className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1.5">
          <a
            href={GAME_PATCH.newsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("footer.patchAria", { v: GAME_PATCH.version })}
            className={`${base} flex items-center gap-2 text-slate-300 hover:bg-white/[0.04] hover:text-emerald-300`}
          >
            {/* Glowing "reviewed for this patch" dot; the ping is switched off for reduced-motion users. */}
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgb(52_211_153/0.7)]" />
            </span>
            {t("footer.patch", { v: GAME_PATCH.version })}
          </a>
          {FOOTER_LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={onNavigate ? (e) => onNavigate(e, l.href) : undefined}
                aria-current={active ? "page" : undefined}
                className={`${base} ${active ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/30" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </nav>

        <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-relaxed text-gray-500">
          {t("footer.line1")} {t("footer.line2a")}{" "}
          <a href={MOONTON_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-400 underline decoration-gray-600 underline-offset-2 transition-colors hover:text-cyan-300">
            Moonton Games
          </a>
          {t("footer.line2b")}
        </p>

        <div className="mt-6 pt-6 border-t border-gray-800 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-gray-400">© {year} MLBB Soundboard &amp; Audio Quiz. All rights reserved.</p>
          <a href={SITE.authorUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition-colors">
            <span>Made with ☕ and ❤️ by</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image/avatar.png" alt="Ralph Rosael" width={18} height={18} className="rounded-full" />
            <span className="group-hover:decoration-blue-500 underline decoration-gray-400 decoration-wavy underline-offset-[4px]">Ralph Rosael</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
