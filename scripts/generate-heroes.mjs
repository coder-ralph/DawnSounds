// Generates src/data/heroes.json from scripts/hero-seed.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { HEROES } from "./hero-seed.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const seen = new Set();
const heroes = HEROES.map(([name, primaryRole, secondaryRole, lane, quote, slugOverride], i) => {
  const slug = slugOverride ?? slugify(name);
  if (seen.has(slug)) throw new Error(`Duplicate slug: ${slug}`);
  seen.add(slug);
  const roles = secondaryRole ? [primaryRole, secondaryRole] : [primaryRole];
  return {
    id: i + 1,
    name,
    slug,
    primaryRole,
    secondaryRole: secondaryRole ?? null,
    roles,
    roleLabel: roles.map(cap).join(" / "),
    lane,
    quote,
    image: `assets/heroes/${primaryRole}/${slug}/${slug}.webp`,
    audio: `assets/heroes/${primaryRole}/${slug}/${slug}.mp3`,
  };
}).sort((a, b) => a.name.localeCompare(b.name));

heroes.forEach((h, i) => (h.id = i + 1));

if (heroes.length !== 133) {
  console.warn(`⚠ Expected 133 heroes, got ${heroes.length}`);
}

writeFileSync(join(root, "src/data/heroes.json"), JSON.stringify(heroes, null, 2) + "\n");
console.log(`✔ Wrote ${heroes.length} heroes → src/data/heroes.json`);
