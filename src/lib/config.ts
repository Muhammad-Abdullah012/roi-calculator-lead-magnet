import rawConfig from "@config/calculator.config.json";
import { calculatorConfigSchema, type CalculatorConfig } from "./schema";

function loadConfig(): CalculatorConfig {
  const parsed = calculatorConfigSchema.safeParse(rawConfig);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid calculator config:\n${issues}`);
  }

  return parsed.data;
}

export const config: CalculatorConfig = loadConfig();

export type { CalculatorConfig };
