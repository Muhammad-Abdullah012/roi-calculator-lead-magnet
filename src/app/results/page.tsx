import Link from "next/link";
import { config } from "@/lib/config";
import { calculate } from "@/lib/calculator";
import { resolveCurrency } from "@/lib/currency";
import { decodeState } from "@/lib/share";
import { buttonClasses } from "@/components/ui/Button";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";

interface SharedState {
  i?: Record<string, unknown>;
  c?: string;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const decoded = d ? decodeState<SharedState>(d) : null;
  const inputs = decoded?.i ?? null;

  if (!inputs) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          This result link is missing or invalid
        </h1>
        <p className="mt-3 text-muted">
          Run the calculator to generate a fresh, shareable churn cost report.
        </p>
        <Link href="/" className={buttonClasses({ className: "mt-7" })}>
          Open the calculator
        </Link>
      </div>
    );
  }

  const currency = resolveCurrency(config, decoded?.c ?? null);
  const result = calculate(inputs, config, currency);

  return (
    <div className="grid-backdrop min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <ResultsDashboard
          config={config}
          result={result}
          currency={currency}
          inputs={inputs}
        />
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Calculate your own churn cost →
          </Link>
        </div>
      </div>
    </div>
  );
}
