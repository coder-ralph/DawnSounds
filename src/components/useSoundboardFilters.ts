"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { buildUrl, EMPTY_FILTERS, filtersEqual, parseFilters, type SoundboardFilters } from "@/lib/filter-url";
import type { SortKey } from "@/lib/heroes";
import { tabFromHash } from "@/lib/tabs";
import type { Lane, Role, TabId } from "@/types";

export interface SoundboardFilterApi extends SoundboardFilters {
  setQuery: (q: string) => void;
  setRoles: (r: Role[]) => void;
  setLanes: (l: Lane[]) => void;
  setSort: (s: SortKey) => void;
  reset: () => void;
  /**
   * URL (path + query + hash) for switching to `tab`: filter params on the Soundboard, none elsewhere.
   * Push this in ONE history call. Pushing "#quiz" and stripping the params afterwards with replaceState
   * loses a race with Next's own history sync, which writes the stale URL back.
   */
  hrefFor: (tab: TabId) => string;
}

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Soundboard filter state, mirrored to the URL query string.
 *
 * - Lives in AppShell, so filters survive switching tabs (the Soundboard itself unmounts).
 * - First render is always "no filters" (matches the server HTML); the URL is read in a layout
 *   effect, i.e. before the browser paints the hydrated page.
 * - `enabled` = the Soundboard tab is showing. On other tabs the params are stripped from the URL
 *   (state is kept) and written back when the user returns.
 * - Changes use history.replaceState: no history entry per click. Search text is debounced because
 *   Safari throttles history updates (~100 per 30 s).
 */
export function useSoundboardFilters(enabled: boolean): SoundboardFilterApi {
  const [filters, setFilters] = useState<SoundboardFilters>(EMPTY_FILTERS);
  const [urlQuery, setUrlQuery] = useState("");
  const [ready, setReady] = useState(false);
  const latest = useRef({ filters, urlQuery });
  latest.current = { filters, urlQuery };

  // URL → state, once, before paint.
  useLayoutEffect(() => {
    const f = parseFilters(window.location.search);
    setFilters(f);
    setUrlQuery(f.query);
    setReady(true);
  }, []);

  // Back / Forward between tab history entries: re-read the URL, but only when landing on the Soundboard
  // (other tabs' entries carry no params and must not wipe the state).
  useEffect(() => {
    const onPop = () => {
      if (tabFromHash(window.location.hash) !== "soundboard") return;
      const f = parseFilters(window.location.search);
      setFilters((cur) => (filtersEqual(cur, f) ? cur : f));
      setUrlQuery(f.query);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Debounce only the free-text search; role / lane / sort go to the URL immediately.
  useEffect(() => {
    if (filters.query === urlQuery) return;
    const id = window.setTimeout(() => setUrlQuery(filters.query), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [filters.query, urlQuery]);

  // state → URL.
  useEffect(() => {
    if (!ready) return; // never overwrite the incoming URL with the empty first-render state
    const next = buildUrl(window.location, enabled ? { ...filters, query: urlQuery } : null);
    const cur = window.location.pathname + window.location.search + window.location.hash;
    if (next !== cur) window.history.replaceState(window.history.state, "", next);
  }, [ready, enabled, filters, urlQuery]);

  const setQuery = useCallback((query: string) => setFilters((f) => ({ ...f, query })), []);
  const setRoles = useCallback((roles: Role[]) => setFilters((f) => ({ ...f, roles })), []);
  const setLanes = useCallback((lanes: Lane[]) => setFilters((f) => ({ ...f, lanes })), []);
  const setSort = useCallback((sort: SortKey) => setFilters((f) => ({ ...f, sort })), []);
  const reset = useCallback(() => {
    setFilters((f) => ({ ...f, query: "", roles: [], lanes: [] }));
    setUrlQuery("");
  }, []);

  const hrefFor = useCallback((tab: TabId) => {
    const { filters: f, urlQuery: q } = latest.current;
    const { pathname, search } = window.location;
    return buildUrl({ pathname, search, hash: `#${tab}` }, tab === "soundboard" ? { ...f, query: q } : null);
  }, []);

  return useMemo(() => ({ ...filters, setQuery, setRoles, setLanes, setSort, reset, hrefFor }), [filters, setQuery, setRoles, setLanes, setSort, reset, hrefFor]);
}
