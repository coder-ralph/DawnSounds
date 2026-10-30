"use client";

import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICTS, LANGS, isLang, type DictKey, type Lang } from "@/lib/i18n";
import { STORAGE_KEYS } from "@/lib/constants";
import { readJSON, writeJSON } from "@/lib/storage";

type Vars = Record<string, string | number>;

export interface Translate {
  (key: DictKey, vars?: Vars): string;
  /** Like t(), but renders **bold** and `code` markup as elements. */
  rich: (key: DictKey, vars?: Vars, strongClass?: string) => React.ReactNode;
}

interface LangApi {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translate;
}

const Ctx = createContext<LangApi | null>(null);

const fill = (s: string, vars?: Vars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // English on first paint (matches the server HTML); the saved language is applied right after mount.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = readJSON<string>(STORAGE_KEYS.lang, "en");
    if (isLang(saved)) setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = LANGS.find((l) => l.code === lang)?.html ?? "en";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    writeJSON(STORAGE_KEYS.lang, l);
  }, []);

  const t = useMemo<Translate>(() => {
    const dict = DICTS[lang];
    const base = ((key: DictKey, vars?: Vars) => fill(dict[key] ?? DICTS.en[key], vars)) as Translate;
    base.rich = (key, vars, strongClass = "font-semibold text-slate-100") => {
      const parts = base(key, vars).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      return parts.map((p, i) =>
        p.startsWith("**") ? (
          <strong key={i} className={strongClass}>
            {p.slice(2, -2)}
          </strong>
        ) : p.startsWith("`") ? (
          <code key={i} className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-300">
            {p.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      );
    };
    return base;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>");
  return ctx;
}

export const useT = () => useLang().t;
