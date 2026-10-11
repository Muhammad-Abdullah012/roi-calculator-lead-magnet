"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CalculationResult } from "@/lib/calculator";
import type { CalculatorConfig, CurrencyDef } from "@/lib/schema";
import { encodeState } from "@/lib/share";
import { MetricCard } from "./MetricCard";
import { BarChartCard } from "./charts/BarChartCard";
import { ProjectionChartCard } from "./charts/ProjectionChartCard";
import { CtaSection } from "@/components/layout/CtaSection";
import { Button } from "@/components/ui/Button";

interface ResultsDashboardProps {
  config: CalculatorConfig;
  result: CalculationResult;
  currency: CurrencyDef;
  inputs: Record<string, unknown>;
  onEdit?: () => void;
}

export function ResultsDashboard({
  config,
  result,
  currency,
  inputs,
  onEdit,
}: ResultsDashboardProps) {
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  const share = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/results?d=${encodeState({
      i: inputs,
      c: currency.code,
    })}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      window.prompt("Copy your shareable link:", url);
    }
  };

  return (
    <div className="space-y-10">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {config.results.title}
        </motion.h2>
        {config.results.subtitle && (
          <p className="mx-auto mt-3 max-w-xl text-muted">{config.results.subtitle}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.metrics.map((metric, index) => (
          <MetricCard
            key={metric.key}
            metric={metric}
            currency={currency}
            animated={config.features.animatedCounters}
            index={index}
          />
        ))}
      </div>

      {result.charts.length > 0 && (
        <div className="grid gap-6">
          {result.charts.map((chart) =>
            chart.type === "bar" ? (
              <BarChartCard key={chart.id} chart={chart} currency={currency} />
            ) : (
              <ProjectionChartCard key={chart.id} chart={chart} currency={currency} />
            ),
          )}
        </div>
      )}

      <CtaSection cta={config.cta} />

      <div className="flex flex-wrap items-center justify-center gap-3">
        {config.features.shareableResults && (
          <Button variant="secondary" onClick={share}>
            {shareState === "copied" ? "Link copied ✓" : "Copy share link"}
          </Button>
        )}
        {onEdit && (
          <Button variant="ghost" onClick={onEdit}>
            Edit my inputs
          </Button>
        )}
      </div>
    </div>
  );
}
