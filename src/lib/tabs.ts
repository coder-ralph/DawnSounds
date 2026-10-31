import type { TabId } from "@/types";

export const TAB_IDS: TabId[] = ["soundboard", "quiz", "ranks"];

/** Extra hash spellings that resolve to a tab, so `/#audio-quiz` links keep working. */
const TAB_ALIASES: Record<string, TabId> = { "audio-quiz": "quiz", leaderboard: "ranks" };

/** `location.hash` ("#quiz", "#audio-quiz", "", …) → tab. Unknown or empty hash → soundboard. */
export function tabFromHash(hash: string): TabId {
  const h = hash.replace(/^#/, "").toLowerCase();
  if ((TAB_IDS as string[]).includes(h)) return h as TabId;
  return TAB_ALIASES[h] ?? "soundboard";
}
