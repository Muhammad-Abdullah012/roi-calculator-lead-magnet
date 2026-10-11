"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { cn } from "@/lib/cn";
import { useCalculatorStore } from "@/store/calculator-store";
import type { ResolvedBooking } from "@/lib/booking";

interface CalEmbedProps {
  booking: ResolvedBooking;
  /** Brand color used for the embed's primary accents. */
  brandColor?: string;
  /** Values used to pre-fill the booking form. */
  prefill?: { name?: string; email?: string };
  className?: string;
}

export function CalEmbed({ booking, brandColor, prefill, className }: CalEmbedProps) {
  const colorMode = useCalculatorStore((state) => state.colorMode);
  const theme = colorMode === "dark" ? "dark" : "light";

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const cal = await getCalApi({ namespace: booking.namespace });
        if (!active) return;
        cal("ui", {
          theme,
          layout: booking.layout,
          hideEventTypeDetails: false,
          styles: { branding: brandColor ? { brandColor } : undefined },
        });
      } catch {
        // Embed script unavailable (offline / blocked); the fallback link covers it.
      }
    })();
    return () => {
      active = false;
    };
  }, [booking.namespace, booking.layout, theme, brandColor]);

  const config: Record<string, string> = {
    layout: booking.layout,
    theme,
  };
  if (prefill?.name) config.name = prefill.name;
  if (prefill?.email) config.email = prefill.email;

  return (
    <div
      className={cn(
        "h-[44rem] w-full overflow-hidden rounded-brand border border-border bg-background",
        className,
      )}
    >
      <Cal
        namespace={booking.namespace}
        calLink={booking.calLink}
        config={config}
        style={{ width: "100%", height: "100%", overflow: "auto" }}
      />
    </div>
  );
}
