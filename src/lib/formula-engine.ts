import { Parser, type Expression } from "expr-eval";
import type { FormulaDef } from "./schema";

export interface EvaluationResult {
  /** Full scope: constants + inputs + every successfully computed formula. */
  values: Record<string, number>;
  /** Only the formula outputs that were computed. */
  computed: Record<string, number>;
  /** Formulas that were skipped because a dependency was missing. */
  skipped: string[];
  /** Evaluation order (topologically sorted formula keys). */
  order: string[];
}

function createParser(): Parser {
  return new Parser({
    operators: {
      add: true,
      subtract: true,
      multiply: true,
      divide: true,
      power: true,
      remainder: true,
      comparison: false,
      logical: false,
      conditional: false,
      concatenate: false,
      in: false,
      assignment: false,
      fndef: false,
    },
  });
}

/** Topologically sort nodes by their dependencies; throws on cycles. */
export function topoSort(deps: Map<string, string[]>): string[] {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const order: string[] = [];

  const visit = (node: string) => {
    if (visited.has(node)) return;
    if (visiting.has(node)) {
      throw new Error(`Circular formula dependency detected at "${node}"`);
    }
    visiting.add(node);
    for (const dep of deps.get(node) ?? []) {
      if (deps.has(dep)) visit(dep);
    }
    visiting.delete(node);
    visited.add(node);
    order.push(node);
  };

  for (const node of deps.keys()) visit(node);
  return order;
}

function isMissing(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "number" && !Number.isFinite(value))
  );
}

/**
 * Parse every formula, resolve their interdependencies, and evaluate them in
 * order. Formulas gated by `requires` (or whose formula dependencies were
 * skipped) are omitted from the output rather than throwing.
 */
export function evaluateFormulas(
  inputs: Record<string, number | undefined>,
  formulas: Record<string, FormulaDef>,
  constants: Record<string, number> = {},
): EvaluationResult {
  const parser = createParser();
  const parsed = new Map<string, Expression>();
  const deps = new Map<string, string[]>();

  for (const [key, def] of Object.entries(formulas)) {
    let expression: Expression;
    try {
      expression = parser.parse(def.expr);
    } catch (error) {
      throw new Error(
        `Failed to parse formula "${key}" (${def.expr}): ${(error as Error).message}`,
      );
    }
    parsed.set(key, expression);
    deps.set(
      key,
      expression.variables().filter((name) => name in formulas),
    );
  }

  const order = topoSort(deps);
  const scope: Record<string, number> = { ...constants };
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      scope[key] = value;
    }
  }

  const computed: Record<string, number> = {};
  const skipped: string[] = [];

  for (const key of order) {
    const def = formulas[key];

    const missingRequirement = (def.requires ?? []).some((name) =>
      isMissing(scope[name]),
    );
    const missingDependency = (deps.get(key) ?? []).some(
      (name) => !(name in computed),
    );

    if (missingRequirement || missingDependency) {
      skipped.push(key);
      continue;
    }

    const value = parsed.get(key)!.evaluate(scope);
    if (typeof value === "number" && Number.isFinite(value)) {
      scope[key] = value;
      computed[key] = value;
    } else {
      skipped.push(key);
    }
  }

  return { values: scope, computed, skipped, order };
}

/** Return variable names referenced by a formula that are not resolvable. */
export function findUnknownVariables(
  expr: string,
  known: Set<string>,
): string[] {
  const parser = createParser();
  return parser
    .parse(expr)
    .variables()
    .filter((name) => !known.has(name));
}
