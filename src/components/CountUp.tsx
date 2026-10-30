"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";

export function CountUp({ value, duration = 1.1, className }: { value: number; duration?: number; className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, { duration, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [value, duration]);
  return <span className={className}>{n.toLocaleString("en-US")}</span>;
}
