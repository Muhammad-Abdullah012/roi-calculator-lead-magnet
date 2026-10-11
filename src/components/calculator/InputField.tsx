"use client";

import type { UseFormRegister } from "react-hook-form";
import type { CurrencyDef, FieldDef } from "@/lib/schema";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface InputFieldProps {
  field: FieldDef;
  register: UseFormRegister<Record<string, unknown>>;
  error?: string;
  currency: CurrencyDef;
}

export function InputField({ field, register, error, currency }: InputFieldProps) {
  const isNumeric =
    field.type === "currency" ||
    field.type === "number" ||
    field.type === "percent";

  const prefix = field.type === "currency" ? field.prefix ?? currency.symbol : field.prefix;
  const suffix = field.type === "percent" ? field.suffix ?? "%" : field.suffix;

  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>
        {field.label}
        {!field.required && (
          <span className="ml-2 text-xs font-normal text-muted">Optional</span>
        )}
      </Label>

      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
            {prefix}
          </span>
        )}
        <Input
          id={field.key}
          type={isNumeric ? "number" : field.type === "email" ? "email" : "text"}
          inputMode={isNumeric ? "decimal" : undefined}
          step={field.step ?? (isNumeric ? "any" : undefined)}
          min={field.min}
          max={field.max}
          placeholder={field.placeholder}
          invalid={Boolean(error)}
          aria-invalid={Boolean(error)}
          className={prefix ? "pl-9" : suffix ? "pr-10" : undefined}
          {...register(field.key)}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-500">{error}</p>
      ) : field.helper ? (
        <p className="text-xs text-muted">{field.helper}</p>
      ) : null}
    </div>
  );
}
