import { buttonClasses } from "@/components/ui/Button";
import type { CalculatorConfig } from "@/lib/schema";

export function CtaSection({ cta }: { cta: CalculatorConfig["cta"] }) {
  return (
    <section className="overflow-hidden rounded-brand border border-primary/30 bg-primary/5 p-8 text-center sm:p-12">
      <h2 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {cta.headline}
      </h2>
      {cta.subheadline && (
        <p className="mx-auto mt-3 max-w-xl text-muted">{cta.subheadline}</p>
      )}
      <div className="mt-7">
        <a
          href={cta.url}
          target="_blank"
          rel="noreferrer"
          className={buttonClasses({ size: "lg" })}
        >
          {cta.buttonLabel}
        </a>
      </div>
    </section>
  );
}
