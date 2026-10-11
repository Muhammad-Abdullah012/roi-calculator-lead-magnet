"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import type { CalculatorConfig } from "@/lib/schema";
import { buildFormSchema, buildDefaultValues } from "@/lib/validation";
import { InputField } from "./InputField";
import { Button } from "@/components/ui/Button";
import type { LeadData, SubmitStatus } from "@/store/calculator-store";

interface LeadCaptureFormProps {
  config: CalculatorConfig;
  status: SubmitStatus;
  error?: string;
  onSubmit: (lead: LeadData) => void;
}

export function LeadCaptureForm({
  config,
  status,
  error,
  onSubmit,
}: LeadCaptureFormProps) {
  const { leadCapture } = config;
  const schema = buildFormSchema(leadCapture.fields);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(leadCapture.fields),
  });

  const submit = handleSubmit((values) => onSubmit(values as LeadData));

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const honeypot = (
      event.currentTarget.elements.namedItem("_gotcha") as HTMLInputElement | null
    )?.value;
    if (honeypot) {
      event.preventDefault();
      onSubmit({ ...(getValues() as LeadData), _gotcha: honeypot });
      return;
    }
    void submit(event);
  };

  const submitting = status === "submitting";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-lg text-center"
    >
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-2xl">
        📊
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {leadCapture.title}
      </h2>
      {leadCapture.subtitle && (
        <p className="mt-2 text-muted">{leadCapture.subtitle}</p>
      )}

      <form onSubmit={handleFormSubmit} className="mt-8 space-y-5 text-left">
        <input
          type="text"
          name="_gotcha"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        {leadCapture.fields.map((field) => (
          <InputField
            key={field.key}
            field={field}
            register={register}
            error={errors[field.key]?.message as string | undefined}
            currency={config.theme.currency}
          />
        ))}

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Sending..." : leadCapture.buttonLabel}
        </Button>

        {leadCapture.privacyNote && (
          <p className="text-center text-xs text-muted">{leadCapture.privacyNote}</p>
        )}
      </form>
    </motion.div>
  );
}
