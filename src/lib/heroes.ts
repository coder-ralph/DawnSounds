import raw from "@/data/heroes.json";
import type { Hero, Lane, Role } from "@/types";

export const HEROES = raw as Hero[];

export interface HeroFilters {
  query: string;
  roles: Role[];
  lanes: Lane[];
}

export type SortKey = "name" | "role" | "lane";

export function filterHeroes(list: Hero[], { query, roles, lanes }: HeroFilters, sort: SortKey): Hero[] {
  const q = query.trim().toLowerCase();
  const out = list.filter((h) => {
    // Short queries match names only; quotes join the search from 3 characters so "mi" doesn't match "misses".
    if (q && !h.name.toLowerCase().includes(q) && !(q.length >= 3 && h.quote.toLowerCase().includes(q))) return false;
    if (roles.length && !h.roles.some((r) => roles.includes(r))) return false;
    if (lanes.length && !lanes.includes(h.lane)) return false;
    return true;
  });
  if (sort === "role") out.sort((a, b) => a.primaryRole.localeCompare(b.primaryRole) || a.name.localeCompare(b.name));
  else if (sort === "lane") out.sort((a, b) => a.lane.localeCompare(b.lane) || a.name.localeCompare(b.name));
  else out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

/** Fisher–Yates. Pass a seeded `rng` for a reproducible order (Daily Challenge). */
export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
