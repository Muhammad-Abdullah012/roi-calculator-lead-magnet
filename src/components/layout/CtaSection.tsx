import { buttonClasses } from "@/components/ui/Button";
import { BookButton } from "@/components/booking/BookButton";
import type { CalculatorConfig } from "@/lib/schema";
import type { ResolvedBooking } from "@/lib/booking";

export function CtaSection({
  cta,
  booking,
  prefill,
}: {
  cta: CalculatorConfig["cta"];
  booking?: ResolvedBooking | null;
  prefill?: { name?: string; email?: string };
}) {
  const usePopup = Boolean(booking && booking.ctaMode === "popup");
  return (
    <section className="overflow-hidden rounded-brand border border-primary/30 bg-primary/5 p-8 text-center sm:p-12">
      <h2 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {cta.headline}
      </h2>
      {cta.subheadline && (
        <p className="mx-auto mt-3 max-w-xl text-muted">{cta.subheadline}</p>
      )}
      <div className="mt-7">
        {usePopup && booking ? (
          <BookButton booking={booking} label={cta.buttonLabel} size="lg" prefill={prefill} />
        ) : (
          <a
            href={cta.url}
            target="_blank"
            rel="noreferrer"
            className={buttonClasses({ size: "lg" })}
          >
            {cta.buttonLabel}
          </a>
        )}
      </div>
    </section>
  );
}
