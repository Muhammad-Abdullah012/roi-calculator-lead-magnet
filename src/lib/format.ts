import type { CurrencyDef, MetricFormat } from "./schema";

const EMPTY = "—";

function isRenderable(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function formatCurrency(
  value: number,
  currency: CurrencyDef,
  options: { compact?: boolean; maximumFractionDigits?: number } = {},
): string {
  if (!isRenderable(value)) return EMPTY;
  const { compact = false, maximumFractionDigits = 0 } = options;
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : maximumFractionDigits,
      currencyDisplay: "narrowSymbol",
    }).format(value);
  } catch {
    const formatted = new Intl.NumberFormat(currency.locale, {
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : maximumFractionDigits,
    }).format(value);
    return `${currency.symbol}${formatted}`;
  }
}

export function formatNumber(
  value: number,
  options: { compact?: boolean; maximumFractionDigits?: number } = {},
): string {
  if (!isRenderable(value)) return EMPTY;
  const { compact = false, maximumFractionDigits = 0 } = options;
  return new Intl.NumberFormat("en-US", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : maximumFractionDigits,
  }).format(value);
}

export function formatPercent(value: number, maximumFractionDigits = 1): string {
  if (!isRenderable(value)) return EMPTY;
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value)}%`;
}

export function formatMetricValue(
  value: number | undefined,
  format: MetricFormat,
  currency: CurrencyDef,
): string {
  if (value === undefined) return EMPTY;
  switch (format) {
    case "currency":
      return formatCurrency(value, currency);
    case "compact-currency":
      return formatCurrency(value, currency, { compact: true });
    case "percent":
      return formatPercent(value);
    case "compact-number":
      return formatNumber(value, { compact: true });
    case "text":
      return String(value);
    case "number":
    default:
      return formatNumber(value);
  }
}
