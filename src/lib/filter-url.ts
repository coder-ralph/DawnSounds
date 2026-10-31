import { LANES, ROLES } from "@/lib/constants";
import type { SortKey } from "@/lib/heroes";
import type { Lane, Role } from "@/types";

// Pure helpers (no React, no window) that map the Soundboard filters <-> URL query string:
//   /?role=Fighter,Assassin&lane=EXP,Jungle&sort=role&q=zil

export interface SoundboardFilters {
  query: string;
  roles: Role[];
  lanes: Lane[];
  sort: SortKey;
}

export const EMPTY_FILTERS: SoundboardFilters = { query: "", roles: [], lanes: [], sort: "name" };

/** Query-string keys owned by the Soundboard. Anything else in the URL is left alone. */
export const FILTER_PARAMS = ["role", "lane", "sort", "q"] as const;

const SORTS: SortKey[] = ["name", "role", "lane"];
const MAX_QUERY = 60;

const norm = (s: string) => s.trim().toLowerCase().replace(/[\s_-]+/g, "");
const LANE_ALIAS: Record<string, Lane> = { midlane: "mid" };

/** "Fighter,assassin&role=Mage" → ["fighter","assassin","mage"] (repeated params and commas both work). */
function tokens(params: URLSearchParams, key: string): string[] {
  return params.getAll(key).flatMap((v) => v.split(",")).map(norm).filter(Boolean);
}

/** Valid values only, de-duplicated, always in the canonical (button) order so equal filters → equal URLs. */
function pick<T extends string>(all: { slug: T; label: string }[], wanted: string[], alias: Record<string, T> = {}): T[] {
  const set = new Set<T>();
  for (const w of wanted) {
    const hit = all.find((x) => x.slug === w || norm(x.label) === w) ?? (alias[w] ? all.find((x) => x.slug === alias[w]) : undefined);
    if (hit) set.add(hit.slug);
  }
  return all.filter((x) => set.has(x.slug)).map((x) => x.slug);
}

export function parseFilters(search: string): SoundboardFilters {
  const p = new URLSearchParams(search);
  const sort = norm(p.get("sort") ?? "");
  return {
    query: (p.get("q") ?? "").trim().slice(0, MAX_QUERY),
    roles: pick(ROLES, tokens(p, "role")),
    lanes: pick(LANES, tokens(p, "lane"), LANE_ALIAS),
    sort: (SORTS as string[]).includes(sort) ? (sort as SortKey) : "name",
  };
}

export const filtersEqual = (a: SoundboardFilters, b: SoundboardFilters) =>
  a.query === b.query && a.sort === b.sort && a.roles.join() === b.roles.join() && a.lanes.join() === b.lanes.join();

/**
 * Returns `pathname + ?search + #hash` with the filter params rewritten (defaults omitted, e.g. no `sort=name`)
 * and every other param/hash preserved. Commas are left readable instead of %2C.
 */
export function buildUrl(loc: { pathname: string; search: string; hash: string }, f: SoundboardFilters | null): string {
  const p = new URLSearchParams(loc.search);
  for (const k of FILTER_PARAMS) p.delete(k);
  if (f) {
    // Canonical (button) order, not click order, so the same filters always give the same URL.
    const roles = ROLES.filter((r) => f.roles.includes(r.slug)).map((r) => r.label).join(",");
    const lanes = LANES.filter((l) => f.lanes.includes(l.slug)).map((l) => l.label).join(",");
    if (roles) p.set("role", roles);
    if (lanes) p.set("lane", lanes);
    if (f.sort !== "name") p.set("sort", f.sort);
    if (f.query.trim()) p.set("q", f.query.trim().slice(0, MAX_QUERY));
  }
  const qs = p.toString().replace(/%2C/gi, ",");
  return `${loc.pathname}${qs ? `?${qs}` : ""}${loc.hash}`;
}
