import { z } from "zod";
import type { FieldDef } from "./schema";

function toNumber(raw: unknown): unknown {
  if (raw === "" || raw === undefined || raw === null) return undefined;
  if (typeof raw === "number") return raw;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? raw : parsed;
}

function numericField(field: FieldDef): z.ZodTypeAny {
  let base = z.number();
  if (field.min !== undefined) {
    base = base.min(field.min, { message: `Must be at least ${field.min}` });
  }
  if (field.max !== undefined) {
    base = base.max(field.max, { message: `Must be at most ${field.max}` });
  }
  const schema = field.required ? base : base.optional();
  return z.preprocess(toNumber, schema);
}

function textField(field: FieldDef): z.ZodTypeAny {
  const base = z.string();
  if (!field.required) {
    return z.preprocess(
      (raw) => (raw === undefined || raw === null ? undefined : raw),
      base.optional(),
    );
  }
  return base.min(1, { message: "This field is required" });
}

function emailField(field: FieldDef): z.ZodTypeAny {
  const base = z.email({ message: "Enter a valid email address" });
  if (field.required) return base;
  return z.preprocess(
    (raw) => (raw === undefined || raw === null || raw === "" ? undefined : raw),
    base.optional(),
  );
}

export function buildFieldSchema(field: FieldDef): z.ZodTypeAny {
  switch (field.type) {
    case "currency":
    case "number":
    case "percent":
      return numericField(field);
    case "email":
      return emailField(field);
    case "text":
    default:
      return textField(field);
  }
}

export function buildFormSchema(fields: FieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) shape[field.key] = buildFieldSchema(field);
  return z.object(shape);
}

export type FormSchema = ReturnType<typeof buildFormSchema>;

export function buildDefaultValues(
  fields: FieldDef[],
): Record<string, string | number | undefined> {
  const values: Record<string, string | number | undefined> = {};
  for (const field of fields) {
    if (field.default !== undefined) {
      values[field.key] = field.default;
    } else if (field.type === "currency" || field.type === "number" || field.type === "percent") {
      values[field.key] = undefined;
    } else {
      values[field.key] = "";
    }
  }
  return values;
}
