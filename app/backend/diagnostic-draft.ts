export const DIAGNOSTIC_SKILL_KEYS = [
  'leitura',
  'compreensao',
  'escrita',
  'adicao',
  'multiplicacao',
  'divisao',
  'porcentagem',
  'medidas',
  'seguranca',
  'direitos',
  'saude',
  'tecnologia',
] as const;

export type DiagnosticDraftState = {
  version: 1;
  skillIndex: number;
  level: number;
  assigned: Record<string, `level:N${1 | 2 | 3 | 4 | 5}`>;
};

export type DiagnosticDraft = DiagnosticDraftState & { updatedAt: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isTimestamp = (value: unknown): value is string => {
  if (typeof value !== 'string' || !value) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value;
};

export function sanitizeDiagnosticDraftState(value: unknown): DiagnosticDraftState | null {
  if (!isRecord(value)) return null;
  const { version, skillIndex, level, assigned } = value;
  if (
    version !== 1 ||
    typeof skillIndex !== 'number' ||
    !Number.isInteger(skillIndex) ||
    skillIndex < 0 ||
    skillIndex > 11 ||
    typeof level !== 'number' ||
    !Number.isInteger(level) ||
    level < 1 ||
    level > 5 ||
    !isRecord(assigned)
  ) {
    return null;
  }
  const clean: DiagnosticDraftState['assigned'] = {};
  for (const [skill, assignment] of Object.entries(assigned)) {
    if (!DIAGNOSTIC_SKILL_KEYS.includes(skill as (typeof DIAGNOSTIC_SKILL_KEYS)[number])) return null;
    if (!/^level:N[1-5]$/.test(String(assignment))) return null;
    clean[skill] = String(assignment) as DiagnosticDraftState['assigned'][string];
  }
  return { version: 1, skillIndex, level, assigned: clean };
}

export function sanitizeDiagnosticDraft(value: unknown): DiagnosticDraft | null {
  const state = sanitizeDiagnosticDraftState(value);
  if (!state || !isRecord(value) || !isTimestamp(value.updatedAt)) return null;
  return { ...state, updatedAt: value.updatedAt };
}

export function createDiagnosticDraft(value: unknown, updatedAt: string): DiagnosticDraft | null {
  const state = sanitizeDiagnosticDraftState(value);
  return state && isTimestamp(updatedAt) ? { ...state, updatedAt } : null;
}

export function canClearDiagnosticDraftAfterFinalization(
  finalDiagnosticSaved: boolean,
  participantUpdated: boolean,
): boolean {
  return finalDiagnosticSaved && participantUpdated;
}
