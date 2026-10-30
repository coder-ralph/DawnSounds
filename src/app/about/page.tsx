import type { Metadata } from "next";
import { AboutPage } from "@/components/AboutPage";
import { SITE } from "@/lib/constants";

const description = "DawnSounds is a solo-built MLBB voice line soundboard and audio quiz for Mobile Legends players: how it's made, how the data works, and what's next.";

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: "/about" },
  openGraph: { title: `About ${SITE.name}`, description, url: "/about", images: [{ url: "/image/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: `About ${SITE.name}`, description, images: ["/image/og.png"] },
};

export default function About() {
  return <AboutPage />;
}
