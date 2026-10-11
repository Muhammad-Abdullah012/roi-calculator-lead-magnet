"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { formatMetricValue } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ComputedMetric } from "@/lib/calculator";
import type { CurrencyDef } from "@/lib/schema";

interface MetricCardProps {
  metric: ComputedMetric;
  currency: CurrencyDef;
  animated: boolean;
  index: number;
}

export function MetricCard({ metric, currency, animated, index }: MetricCardProps) {
  const animatedValue = useCountUp(metric.value, animated);
  const display = animated
    ? formatMetricValue(animatedValue, metric.format, currency)
    : metric.formatted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={cn(
        "rounded-brand border p-5",
        metric.highlight
          ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border bg-surface/60",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {metric.label}
      </p>
      <p
        className={cn(
          "mt-2 text-3xl font-bold tabular-nums tracking-tight",
          metric.highlight ? "text-primary" : "text-foreground",
        )}
      >
        {display}
      </p>
      {metric.description && (
        <p className="mt-1 text-xs text-muted">{metric.description}</p>
      )}
    </motion.div>
  );
}
