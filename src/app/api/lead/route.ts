import { NextResponse } from "next/server";
import { z } from "zod";
import { config } from "@/lib/config";
import { calculate } from "@/lib/calculator";
import { buildReportEmail } from "@/lib/email-template";
import { deliverLead, isLeadDeliveryConfigured } from "@/lib/lead";

export const runtime = "nodejs";

const metricSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number().optional(),
  formatted: z.string(),
});

const payloadSchema = z.object({
  slug: z.string(),
  lead: z.record(z.string(), z.string().optional()),
  inputs: z.record(z.string(), z.unknown()),
  metrics: z.array(metricSchema).optional(),
  utm: z.record(z.string(), z.string().optional()).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { slug, lead, inputs, utm = {} } = parsed.data;

  // Honeypot: silently accept without processing.
  if (lead._gotcha) return NextResponse.json({ ok: true });

  const email = lead.email?.trim();
  if (!email || !z.email().safeParse(email).success) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 422 },
    );
  }

  if (slug !== config.meta.slug) {
    return NextResponse.json({ error: "Unknown calculator." }, { status: 404 });
  }

  // Recompute server-side so the stored/emailed metrics are trustworthy.
  const result = calculate(inputs, config);
  const report = buildReportEmail({
    brandName: config.theme.brandName ?? config.meta.title,
    recipientName: lead.name,
    reportTitle: config.results.title,
    intro:
      "Here is your full churn analysis. The key numbers from your inputs are below.",
    metrics: result.metrics.map((metric) => ({
      label: metric.label,
      formatted: metric.formatted,
    })),
    ctaLabel: config.cta.buttonLabel,
    ctaUrl: config.cta.url,
    footerNote: `${config.theme.brandName ?? config.meta.title} — retention analytics.`,
    primary: config.theme.primary,
    accent: config.theme.accent,
  });

  if (!isLeadDeliveryConfigured()) {
    console.info("[lead] delivery not configured; received lead", { slug, email });
    return NextResponse.json({ ok: true, configured: false });
  }

  const delivery = await deliverLead(
    {
      slug,
      lead: { ...lead, _gotcha: undefined },
      inputs,
      metrics: result.metrics.map((metric) => ({
        key: metric.key,
        label: metric.label,
        value: metric.value,
        formatted: metric.formatted,
      })),
      utm,
      submittedAt: new Date().toISOString(),
    },
    report,
  );

  return NextResponse.json({ ok: true, delivery });
}
