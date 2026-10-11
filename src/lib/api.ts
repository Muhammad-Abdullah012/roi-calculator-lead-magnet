import type { CalculationResult } from "./calculator";

export interface LeadPayload {
  slug: string;
  lead: Record<string, string | undefined>;
  inputs: Record<string, unknown>;
  metrics: { key: string; label: string; value?: number; formatted: string }[];
  utm: Record<string, string | undefined>;
}

export async function submitLead(
  payload: LeadPayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!response.ok) {
      return { ok: false, error: data.error ?? "Something went wrong. Please try again." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }
}

export function metricsForPayload(result: CalculationResult): LeadPayload["metrics"] {
  return result.metrics.map((metric) => ({
    key: metric.key,
    label: metric.label,
    value: metric.value,
    formatted: metric.formatted,
  }));
}
