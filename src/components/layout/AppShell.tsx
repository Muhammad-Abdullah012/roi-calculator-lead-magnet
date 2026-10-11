"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCalculatorStore, type ColorMode } from "@/store/calculator-store";
import { Select } from "@/components/ui/Select";
import type { CurrencyDef } from "@/lib/schema";

interface AppShellProps {
  brandName: string;
  cta: { buttonLabel: string; url: string };
  currencies: CurrencyDef[];
  children: React.ReactNode;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function AppShell({ brandName, cta, currencies, children }: AppShellProps) {
  const colorMode = useCalculatorStore((s) => s.colorMode);
  const toggleColorMode = useCalculatorStore((s) => s.toggleColorMode);
  const currencyCode = useCalculatorStore((s) => s.currencyCode);
  const setCurrencyCode = useCalculatorStore((s) => s.setCurrencyCode);

  useEffect(() => {
    // Read persisted preferences once, then only persist *future* changes.
    // Splitting hydrate from persist avoids the mount race (and StrictMode's
    // double-invoked effects) where the initial "light" default would clobber
    // the stored value before it is read back.
    let mode: ColorMode = "light";
    let currency: string | null = null;
    try {
      const storedMode = localStorage.getItem("roi-color-mode");
      if (storedMode === "dark" || storedMode === "light") mode = storedMode;
      currency = localStorage.getItem("roi-currency");
    } catch {
      /* ignore */
    }

    useCalculatorStore.setState({
      colorMode: mode,
      currencyCode: currency ?? useCalculatorStore.getState().currencyCode,
    });
    document.documentElement.classList.toggle("dark", mode === "dark");

    const unsubscribe = useCalculatorStore.subscribe((state) => {
      document.documentElement.classList.toggle("dark", state.colorMode === "dark");
      try {
        localStorage.setItem("roi-color-mode", state.colorMode);
        if (state.currencyCode) localStorage.setItem("roi-currency", state.currencyCode);
      } catch {
        /* ignore */
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
              {brandName.charAt(0)}
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              {brandName}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {currencies.length > 1 && (
              <Select
                aria-label="Select currency"
                value={currencyCode ?? currencies[0].code}
                onChange={(event) => setCurrencyCode(event.target.value)}
                className="hidden sm:block"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </option>
                ))}
              </Select>
            )}
            <button
              type="button"
              onClick={toggleColorMode}
              aria-label="Toggle color theme"
              className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted transition-colors hover:text-foreground"
            >
              {colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
          <span>
            © {new Date().getFullYear()} {brandName}. Built for founders who hate leaking revenue.
          </span>
          <a
            href={cta.url}
            className="font-medium text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {cta.buttonLabel}
          </a>
        </div>
      </footer>
    </div>
  );
}
