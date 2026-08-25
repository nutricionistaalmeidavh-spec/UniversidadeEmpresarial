import { describe, expect, it } from 'vitest';
import { evaluateObjectiveConsolidation } from '../backend/unit-policy';

describe('server-side unit consolidation', () => {
  it('consolidates three objective items answered correctly', () => {
    const result = evaluateObjectiveConsolidation([
      { attempts: 1, errors: 0 },
      { attempts: 1, errors: 0 },
      { attempts: 1, errors: 0 },
    ]);
    expect(result).toMatchObject({ totalItems: 3, correctItems: 3, consolidated: true });
  });

  it('does not consolidate when only two of three are correct', () => {
    const result = evaluateObjectiveConsolidation([
      { attempts: 1, errors: 0 },
      { attempts: 1, errors: 0 },
      { attempts: 1, errors: 1 },
    ]);
    expect(result).toMatchObject({ correctItems: 2, consolidated: false });
  });

  it('does not consolidate when none of the three are correct', () => {
    const result = evaluateObjectiveConsolidation([
      { attempts: 1, errors: 2 },
      { attempts: 1, errors: 1 },
      { attempts: 1, errors: 3 },
    ]);
    expect(result).toMatchObject({ correctItems: 0, consolidated: false });
  });

  it('allows extra attempts when the final result is correct', () => {
    const result = evaluateObjectiveConsolidation([
      { attempts: 5, errors: 0 },
      { attempts: 3, errors: 0 },
      { attempts: 8, errors: 0 },
    ]);
    expect(result.consolidated).toBe(true);
  });

  it('rejects incomplete objective submissions', () => {
    expect(evaluateObjectiveConsolidation([]).consolidated).toBe(false);
    expect(evaluateObjectiveConsolidation([{ attempts: 1, errors: 0 }]).consolidated).toBe(false);
  });
});
