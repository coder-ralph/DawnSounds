// Scans /public/assets and writes src/data/asset-manifest.json
//
// Why: your folders may not match the convention exactly (e.g. a dual-role hero stored under
// its secondary role, "chang-e" vs "change"). The app resolves each hero to the file that
// actually exists, and skips network requests for anything missing (instant fallbacks).
//
//   node scripts/sync-assets.mjs           → scan + print a report
//   node scripts/sync-assets.mjs --quiet   → scan, one-line summary (used by predev/prebuild)
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const quiet = process.argv.includes("--quiet");
const heroes = JSON.parse(readFileSync(join(root, "src/data/heroes.json"), "utf8"));

const IMAGE_EXT = [".webp", ".png", ".jpg", ".jpeg", ".avif"];
const AUDIO_EXT = [".mp3", ".ogg", ".wav", ".m4a"];
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const urlPath = (...parts) => "/" + parts.map((p) => encodeURIComponent(p)).join("/");
const ext = (f) => f.slice(f.lastIndexOf(".")).toLowerCase();

/** normalized folder name → { image?, audio? } (first match wins; prefers files named like the folder) */
const found = new Map();
const heroesDir = join(pub, "assets/heroes");

if (isDir(heroesDir)) {
  for (const role of readdirSync(heroesDir)) {
    const roleDir = join(heroesDir, role);
    if (!isDir(roleDir)) continue;
    for (const slugDir of readdirSync(roleDir)) {
      const dir = join(roleDir, slugDir);
      if (!isDir(dir)) continue;
      const files = readdirSync(dir);
      const pick = (exts) => {
        const cands = files.filter((f) => exts.includes(ext(f)));
        const exact = cands.find((f) => norm(f.slice(0, f.lastIndexOf("."))) === norm(slugDir));
        return exact ?? cands[0];
      };
      const img = pick(IMAGE_EXT);
      const aud = pick(AUDIO_EXT);
      const key = norm(slugDir);
      const prev = found.get(key) ?? {};
      found.set(key, {
        image: prev.image ?? (img ? urlPath("assets", "heroes", role, slugDir, img) : undefined),
        audio: prev.audio ?? (aud ? urlPath("assets", "heroes", role, slugDir, aud) : undefined),
      });
    }
  }
}

const out = {};
const missingImage = [];
const missingAudio = [];
for (const h of heroes) {
  const hit = found.get(norm(h.slug)) ?? found.get(norm(h.name));
  const entry = {};
  if (hit?.image) entry.image = hit.image;
  if (hit?.audio) entry.audio = hit.audio;
  if (hit) out[h.slug] = entry;
  if (!hit?.image) missingImage.push(h.name);
  if (!hit?.audio) missingAudio.push(h.name);
}

const findIcon = (dir, names) => {
  for (const n of names) {
    for (const e of IMAGE_EXT) {
      if (existsSync(join(pub, "assets", dir, n + e))) return urlPath("assets", dir, n + e);
    }
  }
  return null;
};
const roles = Object.fromEntries(
  ["tank", "fighter", "assassin", "mage", "marksman", "support"].map((r) => [r, findIcon("role", [r])]),
);
const lanes = Object.fromEntries([
  ["exp", findIcon("lane", ["exp"])],
  ["gold", findIcon("lane", ["gold"])],
  ["jungle", findIcon("lane", ["jungle"])],
  ["mid", findIcon("lane", ["midlane", "mid"])],
  ["roam", findIcon("lane", ["roam"])],
]);

const manifest = {
  scanned: found.size > 0,
  stats: {
    heroes: heroes.length,
    withImage: heroes.length - missingImage.length,
    withAudio: heroes.length - missingAudio.length,
  },
  heroes: out,
  roles,
  lanes,
};
writeFileSync(join(root, "src/data/asset-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

const s = manifest.stats;
if (quiet) {
  console.log(
    manifest.scanned
      ? `✔ assets: ${s.withImage}/${s.heroes} images, ${s.withAudio}/${s.heroes} audio`
      : "ℹ assets: none found in public/assets/heroes — using fallbacks (add your files, then rerun)",
  );
} else {
  console.log(`Images: ${s.withImage}/${s.heroes}   Audio: ${s.withAudio}/${s.heroes}`);
  console.log("Role icons:", Object.entries(roles).filter(([, v]) => !v).map(([k]) => k).join(", ") || "all found");
  console.log("Lane icons:", Object.entries(lanes).filter(([, v]) => !v).map(([k]) => k).join(", ") || "all found");
  if (missingImage.length && missingImage.length < heroes.length) console.log("\nMissing images:", missingImage.join(", "));
  if (missingAudio.length && missingAudio.length < heroes.length) console.log("\nMissing audio:", missingAudio.join(", "));
  const known = new Set([...heroes.flatMap((h) => [norm(h.slug), norm(h.name)])]);
  const orphans = [...found.keys()].filter((k) => !known.has(k));
  if (orphans.length) console.log("\nFolders not matching any hero:", orphans.join(", "));
}
