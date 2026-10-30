import type { en } from "./en";

export type DictKey = keyof typeof en;
export type Dict = Record<DictKey, string>;
export type Lang = "en" | "tl" | "zh";
