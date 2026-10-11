"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import type { CalculatorConfig } from "@/lib/schema";
import { buildFormSchema, buildDefaultValues } from "@/lib/validation";
import { calculate } from "@/lib/calculator";
import { resolveCurrency } from "@/lib/currency";
import { captureUtm } from "@/lib/utm";
import { submitLead, metricsForPayload } from "@/lib/api";
import { useCalculatorStore, type LeadData } from "@/store/calculator-store";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { LandingHero } from "./LandingHero";
import { InputField } from "./InputField";
import { StepNavigation } from "./StepNavigation";
import { LeadCaptureForm } from "./LeadCaptureForm";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";

export function CalculatorFlow({ config }: { config: CalculatorConfig }) {
  const steps = config.form.steps;
  const fieldsByKey = useMemo(
    () => new Map(config.form.fields.map((field) => [field.key, field])),
    [config.form.fields],
  );

  const {
    stage,
    stepIndex,
    setStage,
    nextStep,
    prevStep,
    setStepIndex,
    currencyCode,
    status,
    error,
    utm,
    setUtm,
    setLead,
    setStatus,
    setError,
    markSubmitted,
  } = useCalculatorStore();

  const currency = useMemo(
    () => resolveCurrency(config, currencyCode),
    [config, currencyCode],
  );

  const schema = useMemo(() => buildFormSchema(config.form.fields), [config.form.fields]);
  const {
    register,
    trigger,
    control,
    reset,
    formState: { errors },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema) as unknown as Resolver<Record<string, unknown>>,
    defaultValues: buildDefaultValues(config.form.fields),
    mode: "onTouched",
  });

  const values = useWatch({ control }) as Record<string, unknown>;
  const result = useMemo(
    () => calculate(values, config, currency),
    [values, config, currency],
  );

  useEffect(() => {
    if (config.features.utmTracking) setUtm(captureUtm());
  }, [config.features.utmTracking, setUtm]);

  // Only reset scroll when moving between stages (form → lead → results),
  // not when stepping between form fields, so users keep their place.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage]);

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];

  const handleNext = async () => {
    const valid = await trigger(currentStep.fields);
    if (!valid) return;

    if (stepIndex < steps.length - 1) {
      nextStep(steps.length - 1);
      return;
    }

    if (config.leadCapture.enabled) {
      setStage("lead");
    } else {
      markSubmitted();
      setStage("results");
    }
  };

  const handleBack = () => {
    if (stage === "lead") {
      setStage("form");
      setStepIndex(steps.length - 1);
      return;
    }
    prevStep();
  };

  const handleLeadSubmit = async (lead: LeadData) => {
    setStatus("submitting");
    setError(undefined);

    const response = await submitLead({
      slug: config.meta.slug,
      lead,
      inputs: values,
      metrics: metricsForPayload(result),
      utm,
    });

    if (response.ok) {
      setLead(lead);
      setStatus("success");
      markSubmitted();
      setStage("results");
    } else {
      setStatus("error");
      setError(response.error);
    }
  };

  const handleEdit = () => {
    setStage("form");
    setStepIndex(0);
  };

  const handleReset = () => {
    reset(buildDefaultValues(config.form.fields));
    handleEdit();
  };

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-10 sm:px-6 sm:py-16",
        stage === "results" ? "max-w-5xl" : "max-w-3xl",
      )}
    >
      {stage === "form" && (
        <LandingHero
          landing={config.landing}
          onStart={() =>
            document
              .getElementById("calculator")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        />
      )}

      <AnimatePresence mode="wait">
        {stage === "form" && (
          <motion.div
            key={`form-${stepIndex}`}
            id="calculator"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="mt-12 scroll-mt-24"
          >
            <Card className="p-6 shadow-xl shadow-black/5 sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Step {stepIndex + 1}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  {currentStep.title}
                </h2>
                {currentStep.description && (
                  <p className="mt-1 text-sm text-muted">{currentStep.description}</p>
                )}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleNext();
                }}
                className="space-y-6"
              >
                <div className="grid gap-6">
                  {currentStep.fields.map((fieldKey) => {
                    const field = fieldsByKey.get(fieldKey);
                    if (!field) return null;
                    return (
                      <InputField
                        key={field.key}
                        field={field}
                        register={register}
                        error={errors[field.key]?.message as string | undefined}
                        currency={currency}
                      />
                    );
                  })}
                </div>

                <StepNavigation
                  current={stepIndex}
                  total={steps.length}
                  isFirst={stepIndex === 0}
                  isLast={stepIndex === steps.length - 1}
                  onBack={handleBack}
                  onNext={handleNext}
                />
              </form>
            </Card>
          </motion.div>
        )}

        {stage === "lead" && (
          <motion.div
            key="lead"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <Card className="p-6 shadow-xl shadow-black/5 sm:p-10">
              <LeadCaptureForm
                config={config}
                status={status}
                error={error}
                onSubmit={handleLeadSubmit}
              />
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="cursor-pointer text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
                >
                  Back to my inputs
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {stage === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ResultsDashboard
              config={config}
              result={result}
              currency={currency}
              inputs={values}
              onEdit={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
