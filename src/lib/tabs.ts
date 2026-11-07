import type { TabId } from "@/types";

export const TAB_IDS: TabId[] = ["soundboard", "quiz", "ranks"];

/** Extra hash spellings that resolve to a tab, so `/#audio-quiz` links keep working. */
export const TAB_ALIASES: Record<string, TabId> = { "audio-quiz": "quiz", leaderboard: "ranks" };

/** `location.hash` ("#quiz", "#audio-quiz", "", …) → tab. Unknown or empty hash → soundboard. */
export function tabFromHash(hash: string): TabId {
  const h = hash.replace(/^#/, "").toLowerCase();
  if ((TAB_IDS as string[]).includes(h)) return h as TabId;
  // own keys only: `#constructor` or `#toString` must not resolve to an inherited Object method
  return Object.prototype.hasOwnProperty.call(TAB_ALIASES, h) ? TAB_ALIASES[h] : "soundboard";
}

/** Attribute the boot script puts on <html> while the tab named in the URL hash is not on screen yet. */
export const BOOT_TAB_ATTR = "data-boot-tab";

/**
 * Inline script for <head>, run before the first paint. The page is statically prerendered, so its HTML can only ever show the
 * Soundboard; on `/#ranks` or `/#quiz` that wrong tab used to be painted until React hydrated and read the hash. This records the
 * real tab on <html> straight away and globals.css hides the tab content (`[data-boot-mask]`) until AppShell has mounted and
 * removes the attribute. The timeout is a failsafe: if hydration never happens (script error, blocked JS), the content reappears.
 * The tab list and aliases come from the constants above so this can't drift from `tabFromHash`.
 */
export function tabBootScript(): string {
  return `(function(){try{if(location.pathname!=="/")return;var h=location.hash.replace(/^#/,"").toLowerCase(),ids=${JSON.stringify(TAB_IDS)},al=${JSON.stringify(TAB_ALIASES)},t=ids.indexOf(h)>-1?h:Object.prototype.hasOwnProperty.call(al,h)?al[h]:"soundboard";if(t!=="soundboard"){var d=document.documentElement;d.setAttribute("${BOOT_TAB_ATTR}",t);setTimeout(function(){d.removeAttribute("${BOOT_TAB_ATTR}")},4000)}}catch(e){}})();`;
}

/** Called by AppShell once the real tab is rendered: lifts the pre-hydration mask. */
export function clearBootTab() {
  document.documentElement.removeAttribute(BOOT_TAB_ATTR);
}
