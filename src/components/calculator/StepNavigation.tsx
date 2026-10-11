"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface StepNavigationProps {
  current: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function StepNavigation({
  current,
  total,
  isFirst,
  isLast,
  onBack,
  onNext,
}: StepNavigationProps) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums text-muted">
          {current + 1} / {total}
        </span>
      </div>

      <div className={cn("flex items-center gap-3", isFirst ? "justify-end" : "justify-between")}>
        {!isFirst && (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        )}
        <Button onClick={onNext} size="lg" className="flex-1 sm:flex-none sm:min-w-40">
          {isLast ? "Calculate My Results" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
