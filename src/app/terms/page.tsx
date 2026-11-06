import type { Metadata } from "next";
import { TermsPage } from "@/components/TermsPage";
import { SITE } from "@/lib/constants";

const description = "The terms for using DawnSounds, a free, non-commercial Mobile Legends: Bang Bang fan project.";

export const metadata: Metadata = {
  title: "Terms",
  description,
  alternates: { canonical: "/terms" },
  openGraph: { title: `Terms · ${SITE.name}`, description, url: "/terms", images: [{ url: "/image/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: `Terms · ${SITE.name}`, description, images: ["/image/og.png"] },
};

export default function Terms() {
  return <TermsPage />;
}
