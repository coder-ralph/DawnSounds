export type Role = "tank" | "fighter" | "assassin" | "mage" | "marksman" | "support";
export type Lane = "exp" | "gold" | "jungle" | "mid" | "roam";
export type TabId = "soundboard" | "quiz" | "ranks";
export type QuizMode = "classic" | "survival";

export interface Hero {
  id: number;
  name: string;
  slug: string;
  primaryRole: Role;
  secondaryRole: Role | null;
  /** Both roles, primary first. */
  roles: Role[];
  /** e.g. "Tank / Mage" */
  roleLabel: string;
  lane: Lane;
  quote: string;
  /** Convention path (relative to /public), e.g. assets/heroes/assassin/aamon/aamon.webp */
  image: string;
  audio: string;
}

export interface ScoreEntry {
  id: string;
  ign: string;
  mode: QuizMode;
  score: number;
  /** Optional: global rows created without the extra columns won't have these. */
  correct?: number;
  total?: number;
  /** 0–100 */
  accuracy: number;
  bestStreak?: number;
  /** ISO date */
  date: string;
}
