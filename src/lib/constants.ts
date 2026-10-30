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
  daily: "dawnsounds:daily:v1",
} as const;
