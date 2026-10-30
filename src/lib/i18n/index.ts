import { en } from "./en";
import { tl } from "./tl";
import { zh } from "./zh";
import type { Dict, Lang } from "./types";

export type { Dict, DictKey, Lang } from "./types";

export const DICTS: Record<Lang, Dict> = { en, tl, zh };

export const LANGS: { code: Lang; label: string; short: string; html: string }[] = [
  { code: "en", label: "English", short: "EN", html: "en" },
  { code: "tl", label: "Tagalog (Filipino)", short: "TL", html: "tl" },
  { code: "zh", label: "简体中文", short: "中文", html: "zh-CN" },
];

export const isLang = (v: unknown): v is Lang => v === "en" || v === "tl" || v === "zh";
