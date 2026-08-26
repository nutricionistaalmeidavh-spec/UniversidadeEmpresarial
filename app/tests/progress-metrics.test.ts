import { describe, expect, it } from 'vitest';
import { progressMetrics } from '../src/progress-metrics';

describe('sinais adultos de progresso', () => {
  it('calcula semana, tempo, competências e marcos sem pontos', () => {
    const now = Date.parse('2026-08-26T12:00:00Z');
    const progress = Object.fromEntries([1,2,3,4,5].map(level => [`leitura-N${level}`, { status: 'consolidated', durationSec: 600, completedAt: '2026-08-25T12:00:00Z' }]));
    expect(progressMetrics(progress, now)).toEqual({ completedThisWeek: 5, minutes: 50, strengthened: 1, milestones: ['leitura'] });
  });
});
