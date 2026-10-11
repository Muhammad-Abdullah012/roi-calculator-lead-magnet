# ROI Calculator Lead Magnet

A premium, config-driven ROI calculator template. The UI, copy, inputs, **formulas**,
metrics, charts, lead capture and theming are all defined in a single JSON file — no
calculator-specific logic lives in the components. Change the config, get a brand-new
calculator.

Ships with a ready-to-use **SaaS Churn Cost Calculator** as the worked example.

## Why it's a template

Everything specific lives in [`config/calculator.config.json`](config/calculator.config.json):

- **Copy & branding** — headline, subheadline, benefits, brand colors, font, dark mode.
- **Form** — multi-step layout, field definitions, validation rules, helper text.
- **Formulas** — safe math expressions (evaluated with `expr-eval`, never `eval`).
- **Results** — which metrics to show, their formatting, highlight states.
- **Charts** — bar charts and month-by-month projection charts.
- **Lead capture & CTA** — fields, copy, destination.
- **Feature flags** — currency selector, dark mode, animated counters, UTM, share links.

The config is validated by a [Zod](https://zod.dev) schema at load time, so a broken
config fails fast with a precise error instead of breaking at runtime.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # optional for local dev (lead capture works without it)
pnpm dev                     # http://localhost:3000
```

### Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `pnpm dev`         | Start the dev server               |
| `pnpm build`       | Production build                   |
| `pnpm start`       | Serve the production build         |
| `pnpm test`        | Run the formula engine unit tests  |
| `pnpm lint`        | ESLint                             |
| `pnpm typecheck`   | TypeScript, no emit                |

## How formulas work

`formulas` is a map of `name → { expr, requires? }`. Expressions can reference other
formulas, input fields, and constants — order doesn't matter; the engine builds a
dependency graph, topologically sorts it, and detects cycles.

```jsonc
"constants": { "months": 12 },
"formulas": {
  "monthlyRevenueLost": { "expr": "mrr * (monthlyChurnRate / 100)" },
  "annualRevenueLost":  { "expr": "monthlyRevenueLost * months" },
  "customersLostPerMonth": {
    "expr": "monthlyRevenueLost / arpa",
    "requires": ["arpa"]            // skipped when `arpa` is empty
  }
}
```

- **`requires`** marks a formula as optional. If any listed value is missing, the
  formula (and anything depending on it) is skipped instead of erroring.
- **Constants** (`months`) are injected as variables automatically.
- Expressions support the usual arithmetic plus `min`, `max`, `round`, `abs`, `sqrt`,
  `floor`, `ceil`, `pow`, percentages, etc. Boolean/logic operators are disabled.

### Projection charts

Loop-based series (e.g. an MRR decline curve) can't be a single expression, so charts
of type `projection` describe the loop instead:

```jsonc
{
  "id": "mrrDecline",
  "type": "projection",
  "projection": { "start": "mrr", "rate": "monthlyChurnRate", "months": "months", "mode": "compounding" }
}
```

`mode` is `compounding` (loses a share of the current value each month) or `linear`.
Pass an array of projections to draw multiple series (e.g. current vs. reduced churn).

## Supported field types

`currency`, `number`, `percent`, `text`, `email` — each with `required`, `default`,
`placeholder`, `helper`, `prefix`/`suffix`, `min`, `max`, `step`.

## Lead capture

The client posts `{ slug, lead, inputs, metrics, utm }` to `/api/lead`, which validates
the payload, **recomputes** the metrics server-side, then fans out to two destinations
(configured entirely via env vars — both are optional):

- **Google Sheets** via an Apps Script Web App → `GOOGLE_SHEETS_WEBHOOK_URL`
- **Email** (report to the lead + notification to you) via [Resend](https://resend.com)
  → `RESEND_API_KEY`, `RESEND_FROM`, `OWNER_EMAIL`

### Google Sheets setup

See [`scripts/apps-script/Code.gs`](scripts/apps-script/Code.gs) for the full walkthrough.
In short: open a Sheet → Extensions → Apps Script → paste the file → run `setupHeaders`
→ Deploy as a Web app (access: *Anyone*) → copy the URL into `.env.local`.

A hidden honeypot field (`_gotcha`) blocks most bots. Without any env vars the API
accepts the lead, logs it, and continues — so the app is fully usable out of the box.

## Booking (Cal.com)

Add an inline booking calendar to the results page and turn the CTA into a Cal.com
popup. Set it up under the top-level `booking` key:

```jsonc
"booking": {
  "enabled": true,
  "calLink": "your-username/retention-audit", // username/event-slug
  "namespace": "retention-audit",
  "layout": "month_view",       // month_view | week_view | column_view
  "title": "Book your free retention audit",
  "description": "Pick a time that works…",
  "inline": true,               // render the calendar on the results page
  "ctaMode": "popup"            // "popup" (modal) | "link" (uses cta.url)
}
```

The embed is pre-filled with the lead's name/email, follows light/dark mode, and uses
your brand color. Booking is optional — remove `booking` (or set `enabled: false`) and
the CTA falls back to the plain `cta.url` link. Set `NEXT_PUBLIC_CAL_LINK` to override
`calLink` per deployment without editing the config.

## Making it your own calculator

1. Edit `config/calculator.config.json` — copy, inputs, formulas, metrics, charts.
2. Update `theme` for colors / radius / currency.
3. Optionally rename `meta.slug` and set up the lead destinations.

No component code needs to change. The Zod schema in
[`src/lib/schema.ts`](src/lib/schema.ts) documents every available option, and config
errors are reported with their exact path.

## Project structure

```
config/calculator.config.json   # the entire calculator, data-driven
scripts/apps-script/Code.gs     # Google Sheets webhook
src/
  app/                          # Next.js App Router (layout, page, /results, /api/lead)
  components/
    calculator/                 # flow, steps, inputs, lead form
    results/                    # dashboard, metric cards, charts
    booking/                    # Cal.com inline embed + popup button
    layout/                     # app shell, CTA
    ui/                         # button, card, input, label, select menu
  lib/
    schema.ts                   # Zod config schema (the template contract)
    formula-engine.ts           # safe expression eval + dependency graph
    calculator.ts               # inputs + config → metrics & charts
    projection.ts               # month-by-month series
    validation.ts               # builds runtime form validation from config
    format.ts / currency.ts / share.ts / utm.ts / lead.ts / email-template.ts
    booking.ts                  # resolves Cal.com config + env override
  store/calculator-store.ts     # flow stage, lead, theme, currency, UTM
  hooks/useCountUp.ts
```

## Testing

The formula engine, calculator, projections and runtime validation are covered by
Vitest, including the exact worked example from the original spec
(`src/lib/calculator.test.ts`):

```bash
pnpm test
```

## Deploy

Deploys to Vercel with zero config. Add the env vars from `.env.example` in the
project settings. Everything works without them; add them to enable lead delivery.
