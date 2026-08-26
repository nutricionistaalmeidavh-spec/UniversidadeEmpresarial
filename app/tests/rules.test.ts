import { describe, expect, it } from 'vitest';
import { CALIBRATION_BANK, CONTENT, T } from '../src/curriculum';
import {
  canAccessAdmin,
  canManageRoles,
  diagnosticAssignment,
  isUnitConsolidated,
  nextDiagnosticLevel,
  reviewInterval,
} from '../src/rules';

describe('sondagem adaptativa', () => {
  it('avança um nível quando a resposta está correta', () => {
    expect(nextDiagnosticLevel(1, true)).toBe(2);
    expect(diagnosticAssignment(4, true)).toBe('N5');
  });

  it('não permite que um erro atribua abaixo de N1', () => {
    expect(nextDiagnosticLevel(1, false)).toBe(1);
    expect(diagnosticAssignment(3, false)).toBe('N2');
  });
});

describe('progressão e revisão', () => {
  it('usa intervalos progressivos e recua após erro', () => {
    expect(reviewInterval(0, true)).toBe(1);
    expect(reviewInterval(1, true)).toBe(3);
    expect(reviewInterval(3, true)).toBe(14);
    expect(reviewInterval(3, false)).toBe(7);
  });
});

describe('permissões', () => {
  it('libera o painel para RH e administração', () => {
    expect(canAccessAdmin('rh')).toBe(true);
    expect(canAccessAdmin('admin')).toBe(true);
    expect(canAccessAdmin('gestor')).toBe(false);
    expect(canManageRoles('rh')).toBe(false);
    expect(canManageRoles('superadmin')).toBe(true);
  });
});

describe('conclusão e banco curricular', () => {
  it('só consolida unidade quando todos os itens estão corretos', () => {
    expect(isUnitConsolidated(3, 2)).toBe(false);
    expect(isUnitConsolidated(3, 3)).toBe(true);
  });

  it('mantém cinco níveis por competência e banco calibrado', () => {
    expect(T).toHaveLength(12);
    expect(Object.keys(CONTENT)).toHaveLength(60);
    expect(Object.keys(CALIBRATION_BANK)).toHaveLength(60);
  });

  it('usa fundamentos numéricos no início de adição sem exigir algarismos romanos', () => {
    const first = CALIBRATION_BANK['adicao-N1'];
    expect(first.prompt).toContain('maior quantidade');
    expect(first.prompt).not.toMatch(/romano/i);
    expect(CONTENT['adicao-N1'].material).toContain('conteúdo complementar');
  });
});
