import type { Metadata } from "next";
import { ChangelogPage } from "@/components/ChangelogPage";
import { SITE } from "@/lib/constants";

const description = "Every DawnSounds release, newest first: Trivia Arena, prestige badges, the global leaderboard and more.";

export const metadata: Metadata = {
  title: "Changelog",
  description,
  alternates: { canonical: "/changelog" },
  openGraph: { title: `${SITE.name} Changelog`, description, url: "/changelog", images: [{ url: "/image/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: `${SITE.name} Changelog`, description, images: ["/image/og.png"] },
};

export default function Changelog() {
  return <ChangelogPage />;
}
