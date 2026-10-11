import { z } from "zod";

export const FIELD_TYPES = [
  "currency",
  "number",
  "percent",
  "text",
  "email",
] as const;

export const METRIC_FORMATS = [
  "currency",
  "compact-currency",
  "number",
  "compact-number",
  "percent",
  "text",
] as const;

export const fieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(FIELD_TYPES),
  required: z.boolean().default(false),
  default: z.union([z.number(), z.string()]).optional(),
  placeholder: z.string().optional(),
  helper: z.string().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  options: z
    .array(z.object({ label: z.string(), value: z.union([z.string(), z.number()]) }))
    .optional(),
});

export const stepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(z.string().min(1)).min(1),
});

export const formulaSchema = z.object({
  expr: z.string().min(1),
  requires: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export const metricSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  format: z.enum(METRIC_FORMATS).default("number"),
  highlight: z.boolean().default(false),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const projectionSchema = z.object({
  start: z.string().min(1),
  rate: z.string().min(1),
  months: z.string().min(1),
  mode: z.enum(["compounding", "linear"]).default("compounding"),
  label: z.string().optional(),
});

export const chartSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["bar", "projection"]),
  series: z
    .array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
        color: z.string().optional(),
      }),
    )
    .optional(),
  projection: z
    .union([projectionSchema, z.array(projectionSchema)])
    .optional(),
});

export const currencySchema = z.object({
  code: z.string().min(1).default("USD"),
  symbol: z.string().min(1).default("$"),
  locale: z.string().min(1).default("en-US"),
});

export const themeSchema = z.object({
  brandName: z.string().optional(),
  logo: z.string().optional(),
  font: z.string().optional(),
  primary: z.string().default("#6366f1"),
  accent: z.string().default("#06b6d4"),
  background: z.string().default("#ffffff"),
  foreground: z.string().default("#0f172a"),
  muted: z.string().default("#64748b"),
  surface: z.string().default("#f8fafc"),
  border: z.string().default("#e2e8f0"),
  radius: z.string().default("0.75rem"),
  currency: currencySchema.default({ code: "USD", symbol: "$", locale: "en-US" }),
});

export const landingSchema = z.object({
  badge: z.string().optional(),
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  ctaLabel: z.string().default("Get Started"),
  benefits: z.array(z.string()).optional(),
  footnote: z.string().optional(),
});

export const leadCaptureSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  buttonLabel: z.string().default("Send My Report"),
  successMessage: z.string().optional(),
  privacyNote: z.string().optional(),
  fields: z.array(fieldSchema).min(1),
});

export const ctaSchema = z.object({
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  buttonLabel: z.string().min(1),
  url: z.string().min(1),
});

export const bookingSchema = z.object({
  enabled: z.boolean().default(false),
  /** Cal.com link in "username/event-slug" form, e.g. "jane/retention-audit". */
  calLink: z.string().min(1),
  namespace: z.string().default("book"),
  layout: z.enum(["month_view", "week_view", "column_view"]).default("month_view"),
  /** Title/description for the inline embed section on the results page. */
  title: z.string().optional(),
  description: z.string().optional(),
  /** Show the inline calendar on the results page. */
  inline: z.boolean().default(true),
  /** How the CTA button behaves: open a modal popup or link out. */
  ctaMode: z.enum(["popup", "link"]).default("popup"),
});

export const featuresSchema = z.object({
  currencySelector: z.boolean().default(false),
  darkMode: z.boolean().default(true),
  animatedCounters: z.boolean().default(true),
  utmTracking: z.boolean().default(true),
  shareableResults: z.boolean().default(true),
  currencyOptions: z.array(currencySchema).optional(),
});

export const calculatorConfigSchema = z
  .object({
    version: z.string().default("1.0"),
    meta: z.object({
      slug: z.string().min(1),
      title: z.string().min(1),
      description: z.string().optional(),
    }),
    theme: themeSchema,
    landing: landingSchema,
    form: z.object({
      steps: z.array(stepSchema).min(1),
      fields: z.array(fieldSchema).min(1),
    }),
    constants: z.record(z.string(), z.number()).default({}),
    formulas: z.record(z.string(), formulaSchema),
    results: z.object({
      title: z.string().default("Your Results"),
      subtitle: z.string().optional(),
      metrics: z.array(metricSchema).min(1),
      charts: z.array(chartSchema).default([]),
    }),
    leadCapture: leadCaptureSchema,
    cta: ctaSchema,
    booking: bookingSchema.optional(),
    features: featuresSchema.default({
      currencySelector: false,
      darkMode: true,
      animatedCounters: true,
      utmTracking: true,
      shareableResults: true,
    }),
  })
  .superRefine((cfg, ctx) => {
    const inputKeys = new Set(cfg.form.fields.map((f) => f.key));
    const formulaKeys = new Set(Object.keys(cfg.formulas));
    const constantKeys = new Set(Object.keys(cfg.constants));

    for (const step of cfg.form.steps) {
      for (const fieldKey of step.fields) {
        if (!inputKeys.has(fieldKey)) {
          ctx.addIssue({
            code: "custom",
            message: `Step "${step.id}" references unknown field "${fieldKey}"`,
          });
        }
      }
    }

    const recognized = new Set([...inputKeys, ...formulaKeys, ...constantKeys]);

    for (const [name, formula] of Object.entries(cfg.formulas)) {
      for (const dep of formula.requires ?? []) {
        if (!recognized.has(dep)) {
          ctx.addIssue({
            code: "custom",
            message: `Formula "${name}" requires unknown value "${dep}"`,
          });
        }
      }
    }

    for (const metric of cfg.results.metrics) {
      if (!recognized.has(metric.key)) {
        ctx.addIssue({
          code: "custom",
          message: `Metric references unknown value "${metric.key}"`,
        });
      }
    }

    for (const chart of cfg.results.charts) {
      for (const series of chart.series ?? []) {
        if (!recognized.has(series.key)) {
          ctx.addIssue({
            code: "custom",
            message: `Chart "${chart.id}" references unknown series "${series.key}"`,
          });
        }
      }
      const projections = chart.projection
        ? Array.isArray(chart.projection)
          ? chart.projection
          : [chart.projection]
        : [];
      for (const projection of projections) {
        for (const ref of [projection.start, projection.rate, projection.months]) {
          if (!recognized.has(ref)) {
            ctx.addIssue({
              code: "custom",
              message: `Chart "${chart.id}" projection references unknown value "${ref}"`,
            });
          }
        }
      }
    }
  });

export type FieldType = (typeof FIELD_TYPES)[number];
export type MetricFormat = (typeof METRIC_FORMATS)[number];
export type FieldDef = z.infer<typeof fieldSchema>;
export type StepDef = z.infer<typeof stepSchema>;
export type FormulaDef = z.infer<typeof formulaSchema>;
export type MetricDef = z.infer<typeof metricSchema>;
export type ProjectionDef = z.infer<typeof projectionSchema>;
export type ChartDef = z.infer<typeof chartSchema>;
export type CurrencyDef = z.infer<typeof currencySchema>;
export type BookingDef = z.infer<typeof bookingSchema>;
export type CalculatorConfig = z.infer<typeof calculatorConfigSchema>;
export type CalculatorInput = Record<string, number | string | undefined>;
