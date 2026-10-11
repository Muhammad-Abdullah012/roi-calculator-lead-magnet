export type ProjectionMode = "compounding" | "linear";

export interface ProjectionPoint {
  month: number;
  value: number;
}

/**
 * Project a value declining at a monthly rate.
 *
 * - `compounding`: each month loses `rate` of the *current* value.
 * - `linear`: each month loses `rate` of the *starting* value.
 */
export function projectSeries(
  start: number,
  monthlyRatePercent: number,
  months: number,
  mode: ProjectionMode = "compounding",
): ProjectionPoint[] {
  const rate = monthlyRatePercent / 100;
  const points: ProjectionPoint[] = [];
  let current = start;

  for (let month = 0; month <= months; month += 1) {
    if (month > 0) {
      const loss = mode === "compounding" ? current * rate : start * rate;
      current -= loss;
    }
    points.push({ month, value: Math.max(0, current) });
  }

  return points;
}

export interface ProjectionInput {
  start: number;
  rate: number;
  months: number;
  mode?: ProjectionMode;
  label?: string;
}

export interface ProjectionOutput {
  label: string;
  points: ProjectionPoint[];
}

export function projectSeriesSet(inputs: ProjectionInput[]): ProjectionOutput[] {
  return inputs.map((input, index) => ({
    label: input.label ?? `Series ${index + 1}`,
    points: projectSeries(
      input.start,
      input.rate,
      input.months,
      input.mode ?? "compounding",
    ),
  }));
}
