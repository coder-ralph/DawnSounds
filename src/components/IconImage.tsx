"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";

/** Local role/lane icon; falls back to a lucide glyph if the file isn't there. */
export function IconImage({ src, Fallback, className = "size-4" }: { src: string; Fallback: LucideIcon; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Fallback className={className} aria-hidden />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" aria-hidden draggable={false} onError={() => setFailed(true)} className={`${className} object-contain`} />
  );
}
