"use client";

import { useState } from "react";
import { getCalApi } from "@calcom/embed-react";
import { buttonClasses } from "@/components/ui/Button";
import { useCalculatorStore } from "@/store/calculator-store";
import { bookingUrl, type ResolvedBooking } from "@/lib/booking";

interface BookButtonProps {
  booking: ResolvedBooking;
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
  prefill?: { name?: string; email?: string };
}

export function BookButton({
  booking,
  label,
  size = "lg",
  variant = "primary",
  className,
  prefill,
}: BookButtonProps) {
  const colorMode = useCalculatorStore((state) => state.colorMode);
  const [busy, setBusy] = useState(false);

  const open = async () => {
    setBusy(true);
    try {
      const cal = await getCalApi({ namespace: booking.namespace });
      cal("ui", {
        theme: colorMode === "dark" ? "dark" : "light",
        layout: booking.layout,
      });
      const config: Record<string, string> = { layout: booking.layout };
      if (prefill?.name) config.name = prefill.name;
      if (prefill?.email) config.email = prefill.email;
      cal("modal", { calLink: booking.calLink, config });
    } catch {
      window.open(bookingUrl(booking.calLink), "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={open}
      disabled={busy}
      className={buttonClasses({ variant, size, className })}
    >
      {busy ? "Opening…" : label}
    </button>
  );
}
