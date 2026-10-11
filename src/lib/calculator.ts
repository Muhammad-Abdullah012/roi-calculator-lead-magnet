import type {
  ChartDef,
  CalculatorConfig,
  CurrencyDef,
  MetricDef,
} from "./schema";
import { evaluateFormulas } from "./formula-engine";
import { projectSeries, type ProjectionPoint } from "./projection";
import { formatMetricValue } from "./format";

export interface ComputedMetric extends MetricDef {
  value?: number;
  formatted: string;
}

export interface BarChartData {
  type: "bar";
  id: string;
  title: string;
  description?: string;
  data: { name: string; value: number; color: string }[];
}

export interface ProjectionChartData {
  type: "projection";
  id: string;
  title: string;
  description?: string;
  months: number;
  series: { label: string; color: string; points: ProjectionPoint[] }[];
}

export type ComputedChart = BarChartData | ProjectionChartData;

export interface CalculationResult {
  values: Record<string, number>;
  computed: Record<string, number>;
  skipped: string[];
  metrics: ComputedMetric[];
  charts: ComputedChart[];
}

function paletteFor(config: CalculatorConfig): string[] {
  const { primary, accent, muted } = config.theme;
  return [primary, accent, muted, "#f59e0b", "#ef4444", "#10b981"];
}

function buildBarChart(
  chart: ChartDef,
  values: Record<string, number>,
  palette: string[],
): BarChartData {
  return {
    type: "bar",
    id: chart.id,
    title: chart.title,
    description: chart.description,
    data: (chart.series ?? []).map((series, index) => ({
      name: series.label,
      value: values[series.key] ?? 0,
      color: series.color ?? palette[index % palette.length],
    })),
  };
}

function buildProjectionChart(
  chart: ChartDef,
  values: Record<string, number>,
  palette: string[],
): ProjectionChartData | null {
  const projections = chart.projection
    ? Array.isArray(chart.projection)
      ? chart.projection
      : [chart.projection]
    : [];

  const series = projections
    .map((projection, index) => {
      const start = values[projection.start];
      const rate = values[projection.rate];
      const months = values[projection.months];
      if (
        typeof start !== "number" ||
        typeof rate !== "number" ||
        typeof months !== "number"
      ) {
        return null;
      }
      return {
        label: projection.label ?? `Series ${index + 1}`,
        color: palette[index % palette.length],
        points: projectSeries(start, rate, Math.round(months), projection.mode),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (series.length === 0) return null;

  return {
    type: "projection",
    id: chart.id,
    title: chart.title,
    description: chart.description,
    months: Math.max(...series.map((s) => s.points.length - 1)),
    series,
  };
}

export function calculate(
  inputs: Record<string, unknown>,
  config: CalculatorConfig,
  currency?: CurrencyDef,
): CalculationResult {
  const activeCurrency = currency ?? config.theme.currency;
  const numericInputs: Record<string, number | undefined> = {};
  for (const [key, value] of Object.entries(inputs)) {
    numericInputs[key] =
      typeof value === "number"
        ? value
        : value === undefined || value === "" || value === null
          ? undefined
          : Number(value);
  }

  const { values, computed, skipped } = evaluateFormulas(
    numericInputs,
    config.formulas,
    config.constants,
  );

  const metrics: ComputedMetric[] = config.results.metrics.map((metric) => {
    const value = values[metric.key];
    return {
      ...metric,
      value,
      formatted: formatMetricValue(value, metric.format, activeCurrency),
    };
  });

  const palette = paletteFor(config);
  const charts: ComputedChart[] = [];
  for (const chart of config.results.charts) {
    if (chart.type === "bar") {
      charts.push(buildBarChart(chart, values, palette));
    } else {
      const projection = buildProjectionChart(chart, values, palette);
      if (projection) charts.push(projection);
    }
  }

  return { values, computed, skipped, metrics, charts };
}
