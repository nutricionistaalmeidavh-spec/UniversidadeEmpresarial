import { describe, expect, it } from 'vitest';
import { navigationItems } from '../src/navigation-model';

describe('navegação por estado e papel', () => {
  it('mostra sondagem somente antes da conclusão', () => {
    expect(navigationItems({ diagnosticCompleted: false }).map(x => x.id)).toContain('diagnostico');
    expect(navigationItems({ diagnosticCompleted: true }).map(x => x.id)).not.toContain('diagnostico');
  });
  it('mantém destinos principais sem tarefas redundantes', () => {
    expect(navigationItems({ diagnosticCompleted: true }).map(x => x.id)).toEqual(['inicio', 'trilhas']);
  });
  it('adiciona RH somente para papéis autorizados e limita o mobile a quatro destinos', () => {
    expect(navigationItems({ diagnosticCompleted: true, role: 'rh' }).map(x => x.id)).toContain('admin');
    expect(navigationItems({ diagnosticCompleted: true, role: 'gestor' }).map(x => x.id)).not.toContain('admin');
    expect(navigationItems({ diagnosticCompleted: true, role: 'superadmin' }).filter(x => x.primary)).toHaveLength(3);
  });
});
