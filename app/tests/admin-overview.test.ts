import { describe, expect, it } from 'vitest';
import { buildAdminOverview, canAccessAdminOverview } from '../backend/admin-overview';

describe('admin overview aggregation', () => {
  it('aggregates populated participants, reviews, and metrics', () => {
    const overview = buildAdminOverview([
      {
        id: 'p-1',
        name: 'Ana',
        email: 'ana@example.com',
        status: 'active',
        diagnosticCompletedAt: '2026-08-26T10:00:00.000Z',
        skillScores: { leitura: 40 },
        pendingReviews: [{ id: 'review-1', unit: 'leitura-N1' }],
        lastActivityAt: new Date().toISOString(),
      },
      {
        id: 'p-2',
        name: 'Bruno',
        status: 'inactive',
        skillScores: { leitura: 80 },
      },
    ], participant => ({ id: participant.id, name: participant.name }));

    expect(overview.participants).toEqual([
      { id: 'p-1', name: 'Ana' },
      { id: 'p-2', name: 'Bruno' },
    ]);
    expect(overview.pendingReviews).toEqual([
      { id: 'review-1', unit: 'leitura-N1', participantName: 'Ana', participantEmail: 'ana@example.com' },
    ]);
    expect(overview.actionParticipants[0]).toMatchObject({ id: 'p-1', group: 'correct_now', pendingReviews: 1, nextAction: 'Corrigir resposta' });
    expect(overview.actionParticipants[1]).toMatchObject({ id: 'p-2', group: 'inactive' });
    expect(overview.metrics).toEqual({
      total: 2,
      active: 1,
      diagnosed: 1,
      reinforcement: 1,
      publishedUnits: 60,
      competencies: 12,
      areas: 3,
    });
  });

  it('returns stable empty arrays and zeroed participant metrics', () => {
    expect(buildAdminOverview([], participant => participant)).toEqual({
      participants: [],
      pendingReviews: [],
      actionParticipants: [],
      metrics: {
        total: 0,
        active: 0,
        diagnosed: 0,
        reinforcement: 0,
        publishedUnits: 60,
        competencies: 12,
        areas: 3,
      },
    });
  });
});

describe('admin overview authorization', () => {
  it('allows only superadmin, admin, and rh', () => {
    expect(canAccessAdminOverview('superadmin')).toBe(true);
    expect(canAccessAdminOverview('admin')).toBe(true);
    expect(canAccessAdminOverview('rh')).toBe(true);
    expect(canAccessAdminOverview('gestor')).toBe(false);
    expect(canAccessAdminOverview('colaborador')).toBe(false);
    expect(canAccessAdminOverview(undefined)).toBe(false);
  });
});
