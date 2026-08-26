import {
  sanitizeDiagnosticDraft,
  sanitizeDiagnosticDraftState,
  type DiagnosticDraft,
  type DiagnosticDraftState,
} from '../backend/diagnostic-draft';

export type DiagnosticFlowState = Omit<DiagnosticDraftState, 'version'>;

export function diagnosticInitialState(): DiagnosticFlowState {
  return { skillIndex: 0, level: 1, assigned: {} };
}

export function diagnosticProgress(
  state: Pick<DiagnosticFlowState, 'skillIndex'>,
  totalSkills: number,
): { competencyPosition: number; percentage: number } {
  const competencyPosition = Math.min(Math.max(0, state.skillIndex) + 1, totalSkills);
  return { competencyPosition, percentage: Math.round((competencyPosition - 1) / totalSkills * 100) };
}

export function applyLoadedDiagnosticDraft(
  fallback: DiagnosticFlowState,
  loaded: unknown,
): DiagnosticFlowState {
  const draft = sanitizeDiagnosticDraft(loaded);
  return draft
    ? { skillIndex: draft.skillIndex, level: draft.level, assigned: { ...draft.assigned } }
    : { skillIndex: fallback.skillIndex, level: fallback.level, assigned: { ...fallback.assigned } };
}

export function diagnosticDraftPayload(state: DiagnosticFlowState): DiagnosticDraftState | null {
  return sanitizeDiagnosticDraftState({ version: 1, ...state });
}

export type { DiagnosticDraft };
