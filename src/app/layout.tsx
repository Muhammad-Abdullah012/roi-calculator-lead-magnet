import type { Metadata } from "next";
import "./globals.css";
import { config } from "@/lib/config";
import { currencyOptions } from "@/lib/currency";
import { resolveBooking } from "@/lib/booking";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: config.meta.title,
  description: config.meta.description,
};

const themeStyle = `
:root {
  --brand-primary: ${config.theme.primary};
  --brand-accent: ${config.theme.accent};
  --brand-background: ${config.theme.background};
  --brand-foreground: ${config.theme.foreground};
  --brand-muted: ${config.theme.muted};
  --brand-surface: ${config.theme.surface};
  --brand-border: ${config.theme.border};
  --brand-radius: ${config.theme.radius};
}
`;

const themeInit = `
(function () {
  try {
    var stored = localStorage.getItem("roi-color-mode");
    var mode = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    if (mode === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AppShell
          brandName={config.theme.brandName ?? config.meta.title}
          cta={config.cta}
          booking={resolveBooking(config)}
          currencies={config.features.currencySelector ? currencyOptions(config) : []}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
