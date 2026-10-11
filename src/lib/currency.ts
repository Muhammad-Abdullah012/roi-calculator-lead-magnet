import type { CalculatorConfig, CurrencyDef } from "./schema";

export function currencyOptions(config: CalculatorConfig): CurrencyDef[] {
  const options = config.features.currencyOptions ?? [];
  const hasDefault = options.some(
    (option) => option.code === config.theme.currency.code,
  );
  return hasDefault ? options : [config.theme.currency, ...options];
}

export function resolveCurrency(
  config: CalculatorConfig,
  code: string | null | undefined,
): CurrencyDef {
  if (!code) return config.theme.currency;
  return (
    currencyOptions(config).find((option) => option.code === code) ??
    config.theme.currency
  );
}
