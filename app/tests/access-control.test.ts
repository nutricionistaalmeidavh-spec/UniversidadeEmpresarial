import { describe, expect, it } from 'vitest';
import {
  educationJobRole,
  educationRoleChangeDecision,
  effectiveEducationRole,
  isAdministrationRole,
  isEducationRole,
} from '../backend/access-control';

describe('controle de acesso educacional', () => {
  it('normaliza apenas perfis conhecidos e preserva o fallback legado de Administração', () => {
    expect(isEducationRole('rh')).toBe(true);
    expect(isEducationRole('owner')).toBe(false);
    expect(effectiveEducationRole('gestor', 'Administração')).toBe('gestor');
    expect(effectiveEducationRole(undefined, 'Administração')).toBe('admin');
    expect(effectiveEducationRole(undefined, 'Encarregado')).toBe('colaborador');
  });

  it('restringe a administração completa a Superadmin, Admin e RH', () => {
    expect(isAdministrationRole('superadmin')).toBe(true);
    expect(isAdministrationRole('admin')).toBe(true);
    expect(isAdministrationRole('rh')).toBe(true);
    expect(isAdministrationRole('gestor')).toBe(false);
  });

  it('mantém os limites de alteração de perfil do Admin', () => {
    expect(educationRoleChangeDecision({ actorRole: 'admin', targetRole: 'rh', nextRole: 'gestor', isSelf: false })).toBe('allowed');
    expect(educationRoleChangeDecision({ actorRole: 'admin', targetRole: 'admin', nextRole: 'rh', isSelf: false })).toBe('admin-boundary');
    expect(educationRoleChangeDecision({ actorRole: 'admin', targetRole: 'rh', nextRole: 'admin', isSelf: false })).toBe('admin-boundary');
  });

  it('impede que o Superadmin remova o próprio acesso', () => {
    expect(educationRoleChangeDecision({ actorRole: 'superadmin', targetRole: 'superadmin', nextRole: 'admin', isSelf: true })).toBe('self-superadmin-demotion');
    expect(educationRoleChangeDecision({ actorRole: 'superadmin', targetRole: 'admin', nextRole: 'rh', isSelf: false })).toBe('allowed');
  });

  it('mantém o cargo administrativo coerente com o perfil', () => {
    expect(educationJobRole('rh', 'Encarregado')).toBe('Administração');
    expect(educationJobRole('gestor', 'Encarregado')).toBe('Encarregado');
  });
});
