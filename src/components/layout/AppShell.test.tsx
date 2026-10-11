// @vitest-environment jsdom
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { AppShell } from "./AppShell";
import { useCalculatorStore } from "@/store/calculator-store";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

const currencies = [{ code: "USD", symbol: "$", locale: "en-US" }];

function makeShell() {
  return (
    <AppShell brandName="ChurnLens" cta={{ buttonLabel: "Book", url: "#" }} currencies={currencies}>
      <div>content</div>
    </AppShell>
  );
}

function renderShell() {
  return render(<StrictMode>{makeShell()}</StrictMode>);
}

describe("AppShell theme persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    useCalculatorStore.setState({ colorMode: "light", currencyCode: null });
  });

  afterEach(() => cleanup());

  it("restores the stored dark theme on mount", async () => {
    localStorage.setItem("roi-color-mode", "dark");
    renderShell();

    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
    expect(localStorage.getItem("roi-color-mode")).toBe("dark");
  });

  it("keeps the theme after toggling and reloading", async () => {
    const first = renderShell();

    const toggle = await waitFor(() =>
      document.querySelector('[aria-label="Toggle color theme"]'),
    );
    if (!toggle) throw new Error("toggle not found");

    act(() => {
      (toggle as HTMLButtonElement).click();
    });

    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
    expect(localStorage.getItem("roi-color-mode")).toBe("dark");

    // Simulate a full page reload: unmount and reset the store to its defaults.
    first.unmount();
    document.documentElement.className = "";
    useCalculatorStore.setState({ colorMode: "light", currencyCode: null });

    renderShell();

    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
    expect(localStorage.getItem("roi-color-mode")).toBe("dark");
  });
});
