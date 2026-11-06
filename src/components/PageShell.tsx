"use client";

import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import type { TabId } from "@/types";

/** Header + page body + Footer for the standalone pages (/about, /changelog, /privacy, /terms). No header tab is highlighted; clicking one returns to the app on that tab. */
export function PageShell({ children, width = "max-w-3xl" }: { children: React.ReactNode; width?: string }) {
  const router = useRouter();
  const go = (id: TabId) => router.push(`/#${id}`);
  return (
    <div className="flex min-h-dvh flex-col">
      <Header tab={null} onTab={go} />
      <main className={`mx-auto w-full flex-1 px-4 py-10 sm:px-6 sm:py-14 ${width}`}>{children}</main>
      <Footer />
    </div>
  );
}
