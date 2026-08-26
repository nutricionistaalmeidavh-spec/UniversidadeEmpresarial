import { describe, expect, it } from 'vitest';
import { accountMismatchMessage, destinationAfterAuthentication, googleLoginError, loginMethod, shouldRecoverWithGoogle } from '../src/auth-flow';

describe('fluxo de autenticação', () => {
  it('mantém um método coerente por identificador', () => {
    expect(loginMethod('11999999999')).toBe('password');
    expect(loginMethod('pessoa@empresa.com')).toBe('google');
  });
  it('recupera uma sessão expirada pelo Google uma única vez', () => {
    expect(shouldRecoverWithGoogle(true, false)).toBe(true);
    expect(shouldRecoverWithGoogle(true, true)).toBe(false);
    expect(shouldRecoverWithGoogle(false, false)).toBe(false);
  });
  it('direciona senha provisória, novo acesso, jornada e recorrente', () => {
    expect(destinationAfterAuthentication({ mustChangePassword: true })).toBe('password-change');
    expect(destinationAfterAuthentication({ mustChangePassword: false })).toBe('welcome');
    expect(destinationAfterAuthentication({ mustChangePassword: false, diagnosticCompletedAt: '2026-08-26' })).toBe('journey');
    expect(destinationAfterAuthentication({ mustChangePassword: false, diagnosticCompletedAt: '2026-08-26', completedUnits: ['leitura-N1'] })).toBe('home');
  });
  it('explica conta não autorizada, cancelamento e divergência', () => {
    expect(googleLoginError({ response: { status: 403 } })).toContain('não foi liberado');
    expect(googleLoginError({ message: 'popup closed' })).toContain('cancelado');
    expect(accountMismatchMessage('a@x.com', 'b@x.com')).toContain('diferente');
    expect(accountMismatchMessage('A@x.com', 'a@x.com')).toBe('');
  });
});
