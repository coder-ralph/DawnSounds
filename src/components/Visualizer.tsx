"use client";

import { motion } from "framer-motion";

const BARS = [0.5, 0.9, 0.65, 1, 0.55, 0.85, 0.7, 0.95, 0.5];

export function Visualizer({
  active,
  bars = 9,
  height = 40,
  className = "",
  barClass = "bg-cyan-400",
}: {
  active: boolean;
  bars?: number;
  height?: number;
  className?: string;
  barClass?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`} style={{ height }} aria-hidden>
      {Array.from({ length: bars }, (_, i) => {
        const peak = BARS[i % BARS.length];
        return (
          <motion.span
            key={i}
            className={`w-1.5 rounded-full ${barClass}`}
            initial={false}
            animate={
              active
                ? { height: [height * 0.2, height * peak, height * 0.3, height * peak * 0.8, height * 0.2], opacity: 1 }
                : { height: Math.max(6, height * 0.16), opacity: 0.35 }
            }
            transition={
              active
                ? { duration: 0.9 + (i % 3) * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.06 }
                : { duration: 0.25 }
            }
          />
        );
      })}
    </div>
  );
}
