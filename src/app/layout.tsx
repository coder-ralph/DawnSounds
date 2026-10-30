import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource-variable/inter";
import "@fontsource/rajdhani/500.css";
import "@fontsource/rajdhani/600.css";
import "@fontsource/rajdhani/700.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SITE } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dawnsounds.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author, url: SITE.authorUrl }],
  creator: SITE.author,
  keywords: ["MLBB", "Mobile Legends", "voice lines", "soundboard", "hero quiz", "audio quiz"],
  icons: { icon: "/image/logo.png", apple: "/image/logo.png" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [{ url: "/image/og.png", width: 1200, height: 630, alt: SITE.title }],
  },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description, images: ["/image/og.png"] },
};

export const viewport: Viewport = { themeColor: "#0b0f19", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
