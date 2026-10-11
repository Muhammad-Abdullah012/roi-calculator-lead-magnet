import type { BookingDef, CalculatorConfig } from "./schema";

export interface ResolvedBooking extends BookingDef {
  /** Effective Cal.com link after any env override. */
  calLink: string;
}

/**
 * Resolve the active booking config. Returns null when booking is disabled or
 * no Cal.com link is configured. `NEXT_PUBLIC_CAL_LINK` overrides the config so
 * the same build can be deployed with different calendars.
 */
export function resolveBooking(config: CalculatorConfig): ResolvedBooking | null {
  const booking = config.booking;
  if (!booking || !booking.enabled) return null;

  const envLink = process.env.NEXT_PUBLIC_CAL_LINK?.trim();
  const calLink = envLink && envLink.length > 0 ? envLink : booking.calLink;
  if (!calLink) return null;

  return { ...booking, calLink };
}

/** Public booking URL for a Cal.com link (used as a no-JS / offline fallback). */
export function bookingUrl(calLink: string): string {
  return `https://cal.com/${calLink.replace(/^\/+/, "")}`;
}
