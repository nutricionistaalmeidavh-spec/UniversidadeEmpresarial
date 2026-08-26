import { describe, expect, it } from 'vitest';
import { adminFailureDetail, adminGroupLabel, educationRoleLabel } from '../src/admin-rh-model';

describe('modelo de apresentação do RH', () => {
  it('mantém rótulos estáveis para perfis e grupos de ação', () => {
    expect(educationRoleLabel('superadmin')).toBe('Superadmin');
    expect(educationRoleLabel('desconhecido')).toBe('Colaborador');
    expect(adminGroupLabel('correct_now')).toBe('Corrigir agora');
    expect(adminGroupLabel('custom')).toBe('custom');
  });

  it('transforma falhas de sessão e permissão em mensagens seguras', () => {
    expect(adminFailureDetail({ response: { status: 401 } })).toContain('sessão expirou');
    expect(adminFailureDetail({ response: { data: { status: 403 } } })).toContain('não tem permissão');
    expect(adminFailureDetail(new Error('segredo interno'))).toBe('Não foi possível carregar a Administração RH. Tente novamente.');
  });
});
