import { describe, expect, it } from 'vitest';
import { competencySummary, getNextLearningAction, getProgressLabel, type LearningUnit } from '../src/learning-state';

const units: LearningUnit[] = [
  { id: 'leitura-N1', title: 'Leitura', competency: 'leitura', level: 'N1' },
  { id: 'escrita-N1', title: 'Escrita', competency: 'escrita', level: 'N1' },
];

describe('próxima ação', () => {
  it('prioriza sondagem, pendência, continuidade, revisão e conteúdo novo', () => {
    expect(getNextLearningAction({ diagnosticCompleted: false, diagnosticDraft: true, units }).kind).toBe('diagnostic');
    expect(getNextLearningAction({ diagnosticCompleted: true, units, progress: { 'leitura-N1': { status: 'pending_review' } } }).kind).toBe('pending_review');
    expect(getNextLearningAction({ diagnosticCompleted: true, units, progress: { 'leitura-N1': { status: 'practice' } } }).kind).toBe('continue');
    expect(getNextLearningAction({ diagnosticCompleted: true, units, progress: { 'leitura-N1': { status: 'review' } } }).kind).toBe('review');
    expect(getNextLearningAction({ diagnosticCompleted: true, units, recommendedLevel: 'N1' }).kind).toBe('new');
  });
  it('permite continuar outra atividade enquanto uma correção está pendente', () => {
    const action = getNextLearningAction({ diagnosticCompleted: true, units, includePending: false, progress: { 'leitura-N1': { status: 'pending_review' }, 'escrita-N1': { status: 'practice' } } });
    expect(action.kind).toBe('continue');
    expect(action.unit?.id).toBe('escrita-N1');
  });
  it('traduz estados internos sem alterar persistência', () => {
    expect(getProgressLabel()).toBe('Não iniciado');
    expect(getProgressLabel(undefined, true)).toBe('Começando');
    expect(getProgressLabel('practice')).toBe('Aprendendo');
    expect(getProgressLabel('review')).toBe('Praticando');
    expect(getProgressLabel('consolidated')).toBe('Dominado');
    expect(getProgressLabel('pending_review')).toBe('Aguardando correção');
  });
  it('resume a evolução em linguagem natural e mantém detalhes separados', () => {
    expect(competencySummary({ name: 'Leitura', completed: 2, status: 'practice', hasActivity: true })).toEqual({ phrase: 'Leitura: você está avançando.', label: 'Aprendendo', details: { completed: 2, total: 5 } });
  });
});
