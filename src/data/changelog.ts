/**
 * DawnSounds release history, newest first. Add a new entry at the TOP of CHANGELOG when you ship.
 *
 * Versions: v1.0 and v2.0 were prototypes built before the GitHub repository existed; the repository starts at v3.0
 * (the "dawnsounds v3" commit). Entries carry no commit links.
 */
export type ChangeType = "major" | "feature" | "improvement";

export interface ChangeEntry {
  /** anchor id, e.g. #v4-2 */
  id: string;
  /** shown in the version chip; null for the concept entry */
  version: string | null;
  /** display date */
  date: string;
  title: string;
  type: ChangeType;
  /** happened before the repository existed */
  prototype?: boolean;
  /** the project's concept phase */
  concept?: boolean;
  items: string[];
}

export const CHANGELOG: ChangeEntry[] = [
  {
    id: "v4-4",
    version: "v4.4.0",
    date: "Nov 7, 2026",
    title: "Career Rating & Instant Tabs",
    type: "improvement",
    items: [
      "The All tab now ranks players, not single runs: your Career Rating adds up your best score on each of the 7 boards, out of 100,000",
      "Diminishing returns: the rating climbs fast while you are new and slows near the top, so 100,000 (a perfect run on every board) is a long-term goal and a lucky short run can't jump to #1",
      "Each player appears once on the All tab, with how many boards they have played and their total points",
      "Refreshing on the Ranks or Quiz page no longer flashes the Soundboard first: the right tab shows from the first frame",
    ],
  },
  {
    id: "v4-3",
    version: "v4.3.0",
    date: "Nov 7, 2026",
    title: "Player Profiles & All-Tab Rating",
    type: "major",
    items: [
      "Every nickname now has its own Daily Challenge: its own Daily number, attempt, streak and results. A new nickname starts at Daily #1",
      "Switching nicknames on a shared device no longer locks anyone out, and switching back restores that nickname's progress exactly",
      "Recent-player chips and a new-nickname notice make switching quick and typos easy to spot",
      "Existing progress carried over: the nickname that played last keeps its streak and Daily number",
      "The All leaderboard tab ranks every mode by Rating, a run's score as a share of the highest possible, out of 100,000",
    ],
  },
  {
    id: "v4-2",
    version: "v4.2.0",
    date: "Nov 5, 2026",
    title: "Trivia Lengths & Prestige Badges",
    type: "major",
    items: [
      "Choose your Trivia run: 10 (Blitz), 25 (Standard), 50 (Endurance), 75 (Marathon) or 100 (Legend) questions",
      "Every run length has its own leaderboard and podium, so quick runs never compete with marathons",
      "Prestige badges — Savage, Godlike and Mythical Immortal — on the podium, in the rankings and on your result card",
      "Your last chosen run length is remembered; long runs use a continuous progress bar",
      "Stricter server-side score validation: a score has to be achievable for the run length",
    ],
  },
  {
    id: "v4-1",
    version: "v4.1.0",
    date: "Nov 4, 2026",
    title: "Podium & Polish",
    type: "improvement",
    items: [
      "Redesigned top-3 podium with metallic Gold, Silver and Bronze tiers, a winged emblem and clear mode tags",
      "Restored the light-blue fill on the volume slider and added a thumb hover glow",
      "Matched Mathilda's quote to her audio file",
    ],
  },
  {
    id: "v4-0",
    version: "v4.0.0",
    date: "Nov 3, 2026",
    title: "Trivia Arena",
    type: "major",
    items: [
      "New third mode: MLBB Trivia Arena — questions are read aloud, answer with A–D",
      "Four categories: Counters, Items & Spells, Hero Titles, and Skills & Lore, with a per-category breakdown on the results screen",
      "A 100-question bank, reshuffled every run",
      "Quit button on every quiz mode, with a confirmation popup",
    ],
  },
  {
    id: "v3-2",
    version: "v3.2.0",
    date: "Nov 1–2, 2026",
    title: "Filters & Previews",
    type: "improvement",
    items: [
      "Soundboard filters now live in the URL, and every tab change is a history entry (Back and Forward work)",
      "Trivia Arena preview card with a Coming Soon status",
      "Fixed a typo in the Tagalog quiz description",
    ],
  },
  {
    id: "v3-1",
    version: "v3.1.0",
    date: "Oct 31, 2026",
    title: "Polish & Docs",
    type: "improvement",
    items: [
      "Voice line quotes and audio files refreshed for every hero role",
      "Restored the flame streak position, full date with year, and the A–Z sort icon",
      "Languages icon on the language menu",
      "README rewritten with badges, a feature breakdown and the tech stack",
    ],
  },
  {
    id: "v3-0",
    version: "v3.0.0",
    date: "Oct 30, 2026",
    title: "Public Launch",
    type: "major",
    items: [
      "Repository created and DawnSounds v3 shipped",
      "Classic mode became a once-a-day Daily Challenge, with a daily streak and a shareable result grid",
      "The whole app in one repository: hero soundboard with role and lane filters, Classic and Survival modes, and a confirmation before leaving a game in progress",
      "About page and the fan-project disclaimer",
      "Vercel Analytics added (anonymous, cookie-free)",
    ],
  },
  {
    id: "v2-0",
    version: "v2.0.0",
    date: "Oct 2026",
    title: "Global Leaderboard & Supabase",
    type: "feature",
    prototype: true,
    items: [
      "Supabase Postgres backend for global score sync",
      "Classic and Survival global leaderboards, with your best score kept per player and mode",
      "Your IGN is remembered between visits",
      "Interface languages: English, Filipino (Tagalog) and 简体中文",
    ],
  },
  {
    id: "v1-0",
    version: "v1.0.0",
    date: "Oct 2026",
    title: "Local Alpha",
    type: "major",
    prototype: true,
    items: [
      "Project scaffolding with Next.js and Tailwind CSS v4",
      "Core MLBB voice line player, the Guess the Hero audio quiz, and the soundboard asset sync scripts",
      "Everything stored on your own device — no backend yet",
    ],
  },
  {
    id: "concept",
    version: null,
    date: "Aug 30, 2025",
    title: "Project Genesis",
    type: "feature",
    concept: true,
    items: ["The idea and a first architecture sketch — then paused while work and a busy schedule took over"],
  },
];
