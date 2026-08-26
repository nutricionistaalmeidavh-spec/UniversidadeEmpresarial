import { describe, expect, it } from 'vitest';
import {
  canClearDiagnosticDraftAfterFinalization,
  sanitizeDiagnosticDraft,
} from '../backend/diagnostic-draft';
import {
  applyLoadedDiagnosticDraft,
  diagnosticInitialState,
  diagnosticProgress,
} from '../src/diagnostic-flow';

const validDraft = {
  version: 1,
  skillIndex: 2,
  level: 4,
  assigned: { leitura: 'level:N3', compreensao: 'level:N1' },
  updatedAt: '2026-08-26T12:00:00.000Z',
};

describe('rascunho da sondagem', () => {
  it('aceita um rascunho compatível e preserva o estado de retomada', () => {
    expect(sanitizeDiagnosticDraft(validDraft)).toEqual(validDraft);
    expect(applyLoadedDiagnosticDraft(diagnosticInitialState(), validDraft)).toEqual({
      skillIndex: 2,
      level: 4,
      assigned: { leitura: 'level:N3', compreensao: 'level:N1' },
    });
  });

  it('rejeita índices e níveis fora dos limites da sondagem', () => {
    expect(sanitizeDiagnosticDraft({ ...validDraft, skillIndex: 12 })).toBeNull();
    expect(sanitizeDiagnosticDraft({ ...validDraft, level: 0 })).toBeNull();
    expect(sanitizeDiagnosticDraft({ ...validDraft, skillIndex: 1.5 })).toBeNull();
  });

  it('rejeita chaves e valores de competências que não pertencem ao contrato', () => {
    expect(sanitizeDiagnosticDraft({ ...validDraft, assigned: { leitura: 'level:N6' } })).toBeNull();
    expect(sanitizeDiagnosticDraft({ ...validDraft, assigned: { intrusa: 'level:N2' } })).toBeNull();
  });

  it('ignora rascunhos de versões incompatíveis ao retomar', () => {
    expect(sanitizeDiagnosticDraft({ ...validDraft, version: 2 })).toBeNull();
    expect(applyLoadedDiagnosticDraft(diagnosticInitialState(), { ...validDraft, version: 2 })).toEqual(
      diagnosticInitialState(),
    );
  });

  it('calcula o progresso pela competência atual', () => {
    expect(diagnosticProgress({ skillIndex: 2, level: 4, assigned: {} }, 12)).toEqual({
      competencyPosition: 3,
      percentage: 17,
    });
  });

  it('só permite limpar o rascunho depois de salvar o diagnóstico e atualizar a pessoa', () => {
    expect(canClearDiagnosticDraftAfterFinalization(true, true)).toBe(true);
    expect(canClearDiagnosticDraftAfterFinalization(true, false)).toBe(false);
    expect(canClearDiagnosticDraftAfterFinalization(false, true)).toBe(false);
  });
});
