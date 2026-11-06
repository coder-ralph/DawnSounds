import type { Metadata } from "next";
import { PrivacyPage } from "@/components/PrivacyPage";
import { SITE } from "@/lib/constants";

const description = "How DawnSounds handles your data: a nickname, local storage, anonymous analytics and nothing else.";

export const metadata: Metadata = {
  title: "Privacy",
  description,
  alternates: { canonical: "/privacy" },
  openGraph: { title: `Privacy · ${SITE.name}`, description, url: "/privacy", images: [{ url: "/image/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: `Privacy · ${SITE.name}`, description, images: ["/image/og.png"] },
};

export default function Privacy() {
  return <PrivacyPage />;
}
