import { describe, expect, it } from 'vitest';
import { canClearDiagnosticDraftAfterFinalization, sanitizeDiagnosticDraft } from '../backend/diagnostic-draft';
import { applyLoadedDiagnosticDraft, diagnosticInitialState, diagnosticProgress } from '../src/diagnostic-flow';

const validDraft = { version: 2, questionIndex: 2, responses: { 'diag-com-01': 'Horário e local', 'diag-com-02': 'Conferir o cabo' }, confirmationIds: [], updatedAt: '2026-08-26T12:00:00.000Z' };

describe('rascunho da sondagem V2', () => {
  it('aceita um rascunho compatível e preserva a retomada', () => {
    expect(sanitizeDiagnosticDraft(validDraft)).toEqual(validDraft);
    expect(applyLoadedDiagnosticDraft(diagnosticInitialState(), validDraft)).toEqual({ questionIndex: 2, responses: { 'diag-com-01': 'Horário e local', 'diag-com-02': 'Conferir o cabo' }, confirmationIds: [] });
  });
  it('rejeita índice, resposta e confirmação incompatíveis', () => {
    expect(sanitizeDiagnosticDraft({ ...validDraft, questionIndex: 19 })).toBeNull();
    expect(sanitizeDiagnosticDraft({ ...validDraft, responses: { 'diag-com-01': '' } })).toBeNull();
    expect(sanitizeDiagnosticDraft({ ...validDraft, confirmationIds: ['diag-com-confirm', 'diag-com-confirm'] })).toBeNull();
  });
  it('ignora rascunhos legados ao retomar o fluxo V2', () => {
    const legacy = { version: 1, skillIndex: 2, level: 4, assigned: { leitura: 'level:N3' }, updatedAt: '2026-08-26T12:00:00.000Z' };
    expect(sanitizeDiagnosticDraft(legacy)).not.toBeNull();
    expect(applyLoadedDiagnosticDraft(diagnosticInitialState(), legacy)).toEqual(diagnosticInitialState());
  });
  it('calcula o progresso na fase principal e na confirmação', () => {
    expect(diagnosticProgress(diagnosticInitialState())).toMatchObject({ phase: 'primary', position: 1, total: 15 });
    expect(diagnosticProgress({ ...diagnosticInitialState(), questionIndex: 15, confirmationIds: ['diag-com-confirm'] })).toMatchObject({ phase: 'confirmation', position: 1, total: 1 });
  });
  it('só permite limpar o rascunho depois de salvar o diagnóstico e atualizar a pessoa', () => {
    expect(canClearDiagnosticDraftAfterFinalization(true, true)).toBe(true);
    expect(canClearDiagnosticDraftAfterFinalization(true, false)).toBe(false);
    expect(canClearDiagnosticDraftAfterFinalization(false, true)).toBe(false);
  });
});
