"use client";

import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { heroImageSrc } from "@/lib/assets";
import { ROLE_STYLE } from "@/lib/constants";
import type { Hero } from "@/types";

/** Hero portrait with a gamer-avatar placeholder when the image is missing or fails to load. */
export function HeroAvatar({ hero, className = "size-14", rounded = "rounded-xl" }: { hero: Hero; className?: string; rounded?: string }) {
  const src = heroImageSrc(hero);
  const [failed, setFailed] = useState(false);
  const style = ROLE_STYLE[hero.primaryRole];

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={hero.name}
        className={`grid shrink-0 place-items-center bg-gradient-to-br ${style.from} to-ink-800 ring-1 ring-inset ${style.ring} ${style.text} ${className} ${rounded}`}
      >
        <Gamepad2 className="size-1/2" strokeWidth={1.75} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={hero.name}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={`shrink-0 bg-ink-800 object-cover ring-1 ring-inset ring-white/10 ${className} ${rounded}`}
    />
  );
}
