"use client";

import { useEffect, useState } from "react";

export function useCountUp(
  target: number | undefined,
  enabled = true,
  duration = 900,
): number {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (target === undefined || !Number.isFinite(target) || !enabled) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled, duration]);

  if (target === undefined || !Number.isFinite(target)) return 0;
  if (!enabled) return target;
  return animated;
}
