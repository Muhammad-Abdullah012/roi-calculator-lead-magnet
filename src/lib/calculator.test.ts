import { describe, expect, it } from "vitest";
import { config } from "./config";
import { calculate } from "./calculator";
import { evaluateFormulas, topoSort } from "./formula-engine";
import { projectSeries } from "./projection";
import { buildFormSchema } from "./validation";

describe("config", () => {
  it("loads and validates the shipped config", () => {
    expect(config.meta.slug).toBe("saas-churn");
    expect(config.form.steps.length).toBeGreaterThan(0);
  });
});

describe("calculator (IDEA.md worked example)", () => {
  const result = calculate(
    {
      mrr: 25000,
      monthlyChurnRate: 5,
      grossMarginPercent: 80,
      arpa: 99,
      cac: 300,
      churnReductionPercent: 20,
    },
    config,
  );

  it("computes monthly revenue lost", () => {
    expect(result.computed.monthlyRevenueLost).toBeCloseTo(1250, 6);
  });

  it("computes annual revenue lost", () => {
    expect(result.computed.annualRevenueLost).toBeCloseTo(15000, 6);
  });

  it("computes annual profit lost", () => {
    expect(result.computed.annualProfitLost).toBeCloseTo(12000, 6);
  });

  it("estimates customers lost per month", () => {
    expect(result.computed.customersLostPerMonth).toBeCloseTo(12.626, 3);
    expect(result.metrics.find((m) => m.key === "customersLostPerMonth")?.formatted).toBe("13");
  });

  it("estimates wasted acquisition spend", () => {
    expect(result.computed.wastedAcquisitionSpendPerMonth).toBeCloseTo(3787.88, 1);
    expect(result.computed.wastedAcquisitionSpendPerYear).toBeCloseTo(45454.5, 1);
  });

  it("computes annual savings from a 20% churn reduction", () => {
    expect(result.computed.annualSavingsFromChurnReduction).toBeCloseTo(3000, 6);
  });

  it("formats currency metrics", () => {
    const metric = result.metrics.find((m) => m.key === "annualRevenueLost");
    expect(metric?.formatted).toBe("$15,000");
  });

  it("builds all configured charts", () => {
    expect(result.charts.map((c) => c.type)).toEqual([
      "bar",
      "projection",
      "projection",
    ]);
    const compare = result.charts.find((c) => c.id === "churnCompare");
    expect(compare?.type).toBe("projection");
    if (compare?.type === "projection") {
      expect(compare.series).toHaveLength(2);
      expect(compare.series[1].points.at(-1)?.value).toBeGreaterThan(
        compare.series[0].points.at(-1)?.value ?? 0,
      );
    }
  });
});

describe("formula engine", () => {
  it("skips optional formulas when required inputs are missing", () => {
    const { computed, skipped } = evaluateFormulas(
      { mrr: 10000, monthlyChurnRate: 5, grossMarginPercent: 80 },
      config.formulas,
      config.constants,
    );
    expect(computed.customersLostPerMonth).toBeUndefined();
    expect(skipped).toContain("customersLostPerMonth");
    expect(skipped).toContain("wastedAcquisitionSpendPerMonth");
  });

  it("does not throw when inputs are incomplete (first render)", () => {
    const empty = evaluateFormulas({}, config.formulas, config.constants);
    expect(empty.computed).toEqual({});

    const partial = evaluateFormulas(
      { mrr: 25000 },
      config.formulas,
      config.constants,
    );
    expect(partial.computed.monthlyRevenueLost).toBeUndefined();
    expect(partial.skipped).toContain("monthlyRevenueLost");
  });

  it("detects circular dependencies", () => {
    expect(() =>
      topoSort(
        new Map([
          ["a", ["b"]],
          ["b", ["a"]],
        ]),
      ),
    ).toThrow(/circular/i);
  });

  it("resolves dependencies regardless of declaration order", () => {
    const { computed } = evaluateFormulas(
      { x: 2 },
      {
        total: { expr: "double + 1" },
        double: { expr: "x * 2" },
      },
      {},
    );
    expect(computed.double).toBe(4);
    expect(computed.total).toBe(5);
  });
});

describe("projection", () => {
  it("compounds a declining value month over month", () => {
    const points = projectSeries(25000, 5, 12, "compounding");
    expect(points).toHaveLength(13);
    expect(points[0].value).toBe(25000);
    expect(points[1].value).toBeCloseTo(23750, 6);
    expect(points[12].value).toBeCloseTo(13509.1, 0);
  });

  it("supports linear decline", () => {
    const points = projectSeries(1200, 10, 12, "linear");
    expect(points[12].value).toBe(0);
    expect(points[6].value).toBeCloseTo(480, 6);
  });
});

describe("validation", () => {
  const schema = buildFormSchema(config.form.fields);

  it("accepts the default values", () => {
    const parsed = schema.safeParse({
      mrr: 25000,
      monthlyChurnRate: 5,
      grossMarginPercent: 80,
      arpa: 99,
      cac: 300,
      churnReductionPercent: 20,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const parsed = schema.safeParse({ monthlyChurnRate: 5 });
    expect(parsed.success).toBe(false);
  });

  it("coerces numeric strings and allows empty optional fields", () => {
    const parsed = schema.safeParse({
      mrr: "25000",
      monthlyChurnRate: "5",
      grossMarginPercent: "80",
      arpa: "",
      cac: "",
      churnReductionPercent: "",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.mrr).toBe(25000);
      expect(parsed.data.arpa).toBeUndefined();
    }
  });

  it("enforces percent bounds", () => {
    const parsed = schema.safeParse({
      mrr: 25000,
      monthlyChurnRate: 150,
      grossMarginPercent: 80,
    });
    expect(parsed.success).toBe(false);
  });
});
