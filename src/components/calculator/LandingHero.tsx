"use client";

import { motion } from "framer-motion";
import type { CalculatorConfig } from "@/lib/schema";
import { Button } from "@/components/ui/Button";

export function LandingHero({
  landing,
  onStart,
}: {
  landing: CalculatorConfig["landing"];
  onStart: () => void;
}) {
  return (
    <div className="text-center">
      {landing.badge && (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary"
        >
          {landing.badge}
        </motion.span>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
      >
        {landing.headline}
      </motion.h1>

      {landing.subheadline && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg"
        >
          {landing.subheadline}
        </motion.p>
      )}

      {landing.benefits && landing.benefits.length > 0 && (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mx-auto mt-7 flex max-w-2xl flex-col items-center gap-2 text-sm text-muted sm:text-base"
        >
          {landing.benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              {benefit}
            </li>
          ))}
        </motion.ul>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-9"
      >
        <Button size="lg" onClick={onStart} className="min-w-56">
          {landing.ctaLabel}
        </Button>
        {landing.footnote && (
          <p className="mt-3 text-xs text-muted">{landing.footnote}</p>
        )}
      </motion.div>
    </div>
  );
}
