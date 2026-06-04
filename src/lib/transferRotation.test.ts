import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getActiveAccountIndex, getTransferAccounts, getRotationMetadata } from './transferRotation';

describe('transferRotation.ts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('debería retornar 0 (Cuenta 1) si la fecha actual es anterior al epoch fijado', () => {
    // Establecer fecha antes del 2026-01-05
    const date = new Date('2025-12-31T12:00:00Z');
    vi.setSystemTime(date);

    expect(getActiveAccountIndex()).toBe(0);
  });

  it('debería alternar correctamente entre 0 y 1 según las semanas transcurridas desde el epoch', () => {
    const epoch = new Date('2026-01-05T00:00:00Z');
    
    // Semana 0: Cuenta 1 (índice 0)
    vi.setSystemTime(new Date(epoch.getTime() + 2 * 24 * 60 * 60 * 1000)); // +2 días
    expect(getActiveAccountIndex()).toBe(0);

    // Semana 1: Cuenta 2 (índice 1)
    vi.setSystemTime(new Date(epoch.getTime() + 8 * 24 * 60 * 60 * 1000)); // +8 días
    expect(getActiveAccountIndex()).toBe(1);

    // Semana 2: Cuenta 1 (índice 0)
    vi.setSystemTime(new Date(epoch.getTime() + 15 * 24 * 60 * 60 * 1000)); // +15 días
    expect(getActiveAccountIndex()).toBe(0);
  });

  it('debería recuperar las cuentas bancarias personalizadas de localStorage', () => {
    localStorage.setItem('ramito_transfer_alias_1', 'MI.ALIAS.UNO');
    localStorage.setItem('ramito_transfer_alias_2', 'MI.ALIAS.DOS');

    const accounts = getTransferAccounts();
    expect(accounts.account1.alias).toBe('MI.ALIAS.UNO');
    expect(accounts.account2.alias).toBe('MI.ALIAS.DOS');
  });

  it('debería calcular correctamente los metadatos de rotación semanal', () => {
    const epoch = new Date('2026-01-05T00:00:00Z');
    
    // Configurar a 3 días después del epoch (jueves)
    vi.setSystemTime(new Date(epoch.getTime() + 3 * 24 * 60 * 60 * 1000));
    
    const meta = getRotationMetadata();
    // Quedan 4 días para completar la semana de 7 días
    expect(meta.daysRemainingInWeek).toBe(4);
    expect(meta.nextAccount).toBe('Cuenta 2 (Semana B)');
    expect(meta.currentWeekLabel).toBe('Semana de Cuenta 1');
  });
});
