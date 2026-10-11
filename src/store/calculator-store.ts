import { create } from "zustand";
import type { UtmData } from "@/lib/utm";

export type FlowStage = "form" | "lead" | "results";
export type SubmitStatus = "idle" | "submitting" | "success" | "error";
export type ColorMode = "light" | "dark";

export interface LeadData {
  [key: string]: string | undefined;
}

interface CalculatorState {
  stage: FlowStage;
  stepIndex: number;
  currencyCode: string | null;
  colorMode: ColorMode;
  lead: LeadData;
  status: SubmitStatus;
  error?: string;
  utm: UtmData;
  submitted: boolean;

  setStage: (stage: FlowStage) => void;
  setStepIndex: (index: number) => void;
  nextStep: (max: number) => void;
  prevStep: () => void;
  setCurrencyCode: (code: string | null) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  setLead: (lead: LeadData) => void;
  setStatus: (status: SubmitStatus) => void;
  setError: (error?: string) => void;
  setUtm: (utm: UtmData) => void;
  markSubmitted: () => void;
  reset: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  stage: "form",
  stepIndex: 0,
  currencyCode: null,
  colorMode: "light",
  lead: {},
  status: "idle",
  error: undefined,
  utm: {},
  submitted: false,

  setStage: (stage) => set({ stage }),
  setStepIndex: (stepIndex) => set({ stepIndex }),
  nextStep: (max) =>
    set((state) => ({ stepIndex: Math.min(state.stepIndex + 1, max) })),
  prevStep: () =>
    set((state) => ({ stepIndex: Math.max(state.stepIndex - 1, 0) })),
  setCurrencyCode: (currencyCode) => set({ currencyCode }),
  setColorMode: (colorMode) => set({ colorMode }),
  toggleColorMode: () =>
    set((state) => ({ colorMode: state.colorMode === "dark" ? "light" : "dark" })),
  setLead: (lead) => set({ lead }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setUtm: (utm) => set({ utm }),
  markSubmitted: () => set({ submitted: true }),
  reset: () =>
    set({
      stage: "form",
      stepIndex: 0,
      lead: {},
      status: "idle",
      error: undefined,
      submitted: false,
    }),
}));
