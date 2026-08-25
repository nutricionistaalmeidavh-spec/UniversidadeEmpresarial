export type ObjectiveStat = { attempts: number; errors: number };

export type ConsolidationResult = {
  totalItems: 3;
  correctItems: number;
  consolidated: boolean;
};

/**
 * Server-side rule for objective units: exactly three objective items must be
 * present and each one must have at least one attempt with zero errors.
 * Frontend totals are deliberately ignored.
 */
export function evaluateObjectiveConsolidation(stats: ObjectiveStat[]): ConsolidationResult {
  const items = stats.slice(0, 3);
  const correctItems = items.filter((item) => item.attempts >= 1 && item.errors === 0).length;
  return {
    totalItems: 3,
    correctItems,
    consolidated: items.length === 3 && correctItems === 3,
  };
}
