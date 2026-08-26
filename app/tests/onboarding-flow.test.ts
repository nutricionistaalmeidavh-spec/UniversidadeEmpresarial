import { describe, expect, it } from 'vitest';
import { onboardingState } from '../src/onboarding-flow';

describe('primeiro acesso', () => {
  it('distingue boas-vindas, retomada, jornada e retorno', () => {
    expect(onboardingState({})).toBe('welcome');
    expect(onboardingState({ diagnosticDraft: true })).toBe('diagnostic');
    expect(onboardingState({ diagnosticCompletedAt: '2026-08-26' })).toBe('journey');
    expect(onboardingState({ diagnosticCompletedAt: '2026-08-26', completedUnits: ['leitura-N1'] })).toBe('returning');
  });
});
