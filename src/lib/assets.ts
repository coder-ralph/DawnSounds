import manifest from "@/data/asset-manifest.json";
import { LANES } from "@/lib/constants";
import type { Hero, Lane, Role } from "@/types";

type HeroAssets = { image?: string; audio?: string };
const heroAssets = manifest.heroes as Record<string, HeroAssets>;

/**
 * `scanned` = the sync script found at least one hero folder in /public/assets/heroes.
 * - scanned: trust the manifest, skip requests for files that don't exist (instant fallback).
 * - not scanned (e.g. assets are deployed separately): fall back to the naming convention
 *   and rely on onError / speech synthesis.
 */
const scanned = manifest.scanned;

export function heroImageSrc(h: Hero): string | null {
  if (scanned) return heroAssets[h.slug]?.image ?? null;
  return "/" + h.image;
}

export function heroAudioSrc(h: Hero): string | null {
  if (scanned) return heroAssets[h.slug]?.audio ?? null;
  return "/" + h.audio;
}

export const roleIconSrc = (r: Role) => `/assets/role/${r}.webp`;
export const laneIconSrc = (l: Lane) => `/assets/lane/${LANES.find((x) => x.slug === l)!.file}.webp`;

export const assetStats = manifest.stats;
export const assetsScanned = scanned;

/** Heroes the quiz may use: only ones with real audio, if enough exist; otherwise everyone (speech fallback). */
export function quizPool(all: Hero[]): { pool: Hero[]; usingSpeechFallback: boolean } {
  if (!scanned) return { pool: all, usingSpeechFallback: true };
  const withAudio = all.filter((h) => heroAssets[h.slug]?.audio);
  return withAudio.length >= 12
    ? { pool: withAudio, usingSpeechFallback: false }
    : { pool: all, usingSpeechFallback: true };
}
