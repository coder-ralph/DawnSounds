import { Crosshair, Shield, Swords, Sparkles, HeartHandshake, Skull } from "lucide-react";
import { Axe, Coins, Trees, Wand2, Footprints } from "lucide-react";
import type { Lane, Role } from "@/types";

export const SITE = {
  name: "DawnSounds",
  title: "DawnSounds — MLBB Voice Line Soundboard & Audio Quiz",
  description:
    "Play the voice lines of all 133 Mobile Legends: Bang Bang heroes, filter by role and lane, then test your ears in the Guess the Hero audio quiz.",
  author: "Ralph Rosael",
  authorUrl: "https://ralphrosael.tech",
} as const;

export const MOONTON_URL = "https://en.moonton.com/";

/**
 * The game patch the content (hero roster, trivia questions) was last reviewed against. Update this one value after a review:
 * the footer chip and the About page both read it.
 */
export const GAME_PATCH = { version: "2.2.16a", newsUrl: "https://www.mobilelegends.com/news" } as const;

/** Public repository: README + issue templates only (the application source is private). */
export const REPO_URL = "https://github.com/coder-ralph/mlbbdawnsounds";
export const ISSUES_URL = `${REPO_URL}/issues`;

/** Direct links to the issue forms in .github/ISSUE_TEMPLATE (the file name is the `template` value). */
export const REMOVAL_ISSUE_URL = `${ISSUES_URL}/new?template=removal-request.yml`;
export const TAKEDOWN_ISSUE_URL = `${ISSUES_URL}/new?template=content-takedown.yml`;
export const REPORT_ISSUE_URL = `${ISSUES_URL}/new?template=outdated-question.yml`;
/** General questions: the template chooser (the three forms plus a blank issue). */
export const CONTACT_ISSUE_URL = `${ISSUES_URL}/new/choose`;

/** Internal pages linked from the footer, in display order (labels are the i18n keys). */
export const FOOTER_LINKS = [
  { href: "/about", key: "footer.about" },
  { href: "/privacy", key: "footer.privacy" },
  { href: "/terms", key: "footer.terms" },
  { href: "/changelog", key: "footer.changelog" },
] as const;
export type FooterHref = (typeof FOOTER_LINKS)[number]["href"];

export const ROLES: { slug: Role; label: string; icon: typeof Shield }[] = [
  { slug: "tank", label: "Tank", icon: Shield },
  { slug: "fighter", label: "Fighter", icon: Swords },
  { slug: "assassin", label: "Assassin", icon: Skull },
  { slug: "mage", label: "Mage", icon: Sparkles },
  { slug: "marksman", label: "Marksman", icon: Crosshair },
  { slug: "support", label: "Support", icon: HeartHandshake },
];

export const LANES: { slug: Lane; label: string; file: string; icon: typeof Shield }[] = [
  { slug: "exp", label: "EXP", file: "exp", icon: Axe },
  { slug: "gold", label: "Gold", file: "gold", icon: Coins },
  { slug: "jungle", label: "Jungle", file: "jungle", icon: Trees },
  { slug: "mid", label: "Mid", file: "midlane", icon: Wand2 },
  { slug: "roam", label: "Roam", file: "roam", icon: Footprints },
];

/** Tailwind classes per role — kept as full literals so Tailwind can see them. */
export const ROLE_STYLE: Record<Role, { text: string; ring: string; bg: string; from: string }> = {
  tank: { text: "text-sky-300", ring: "ring-sky-400/40", bg: "bg-sky-400/10", from: "from-sky-500/30" },
  fighter: { text: "text-orange-300", ring: "ring-orange-400/40", bg: "bg-orange-400/10", from: "from-orange-500/30" },
  assassin: { text: "text-rose-300", ring: "ring-rose-400/40", bg: "bg-rose-400/10", from: "from-rose-500/30" },
  mage: { text: "text-violet-300", ring: "ring-violet-400/40", bg: "bg-violet-400/10", from: "from-violet-500/30" },
  marksman: { text: "text-amber-300", ring: "ring-amber-400/40", bg: "bg-amber-400/10", from: "from-amber-500/30" },
  support: { text: "text-emerald-300", ring: "ring-emerald-400/40", bg: "bg-emerald-400/10", from: "from-emerald-500/30" },
};

export const STORAGE_KEYS = {
  ign: "dawnsounds:ign",
  scores: "dawnsounds:scores:v1",
  view: "dawnsounds:view",
  volume: "dawnsounds:volume",
  muted: "dawnsounds:muted",
  lang: "dawnsounds:lang",
  /** Legacy (v1): ONE Daily history for the whole browser. Read once to migrate it into a profile, then deleted. */
  daily: "dawnsounds:daily:v1",
  /** v2: one Daily history per nickname. The full key is this prefix + profileKey(nickname). */
  dailyProfile: "dawnsounds:daily:v2:",
  /** Nicknames played with on this device, most recent first (powers the "Recent players" chips). */
  profiles: "dawnsounds:profiles",
  triviaLen: "dawnsounds:trivia-length",
} as const;
