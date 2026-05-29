/**
 * Calculates which bank account is currently active.
 * 0 = Cuenta 1 (Semana A)
 * 1 = Cuenta 2 (Semana B)
 */
export function getActiveAccountIndex(): number {
  const msInWeek = 7 * 24 * 60 * 60 * 1000;
  // Use a fixed epoch: Monday, Jan 5, 2026
  const epoch = new Date('2026-01-05T00:00:00Z').getTime();
  const now = Date.now();
  
  if (now < epoch) {
    return 0;
  }
  
  const weeksElapsed = Math.floor((now - epoch) / msInWeek);
  return weeksElapsed % 2;
}

export interface BankAccount {
  alias: string;
  cbu: string;
  titular: string;
}

export function getTransferAccounts(): { account1: BankAccount; account2: BankAccount; activeIndex: number; activeAccount: BankAccount } {
  const alias1 = localStorage.getItem('ramito_transfer_alias_1') || 'RAMITO.FUT.SHOW';
  const cbu1 = localStorage.getItem('ramito_transfer_cbu_1') || '0000003100012345678901';
  const titular1 = localStorage.getItem('ramito_transfer_titular_1') || 'RAMITO FUT SHOW S.R.L.';

  const alias2 = localStorage.getItem('ramito_transfer_alias_2') || 'RAMITO.FUT.SEGUNDA';
  const cbu2 = localStorage.getItem('ramito_transfer_cbu_2') || '0000003100098765432109';
  const titular2 = localStorage.getItem('ramito_transfer_titular_2') || 'COMPLEJO RAMITO S.A.';

  const activeIndex = getActiveAccountIndex();

  const account1 = { alias: alias1, cbu: cbu1, titular: titular1 };
  const account2 = { alias: alias2, cbu: cbu2, titular: titular2 };

  return {
    account1,
    account2,
    activeIndex,
    activeAccount: activeIndex === 0 ? account1 : account2
  };
}

/**
 * Returns remaining days of current active week, and simple description of current rotation cycle
 */
export function getRotationMetadata() {
  const msInWeek = 7 * 24 * 60 * 60 * 1000;
  const epoch = new Date('2026-01-05T00:00:00Z').getTime();
  const now = Date.now();
  
  if (now < epoch) {
    return { daysRemainingInWeek: 7, nextAccount: 'Cuenta 2' };
  }
  
  const msElapsed = now - epoch;
  const currentWeekStartMs = epoch + Math.floor(msElapsed / msInWeek) * msInWeek;
  const nextWeekStartMs = currentWeekStartMs + msInWeek;
  const msRemaining = nextWeekStartMs - now;
  
  const daysRemaining = Math.max(1, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
  const activeIndex = getActiveAccountIndex();
  
  return {
    daysRemainingInWeek: daysRemaining,
    nextAccount: activeIndex === 0 ? 'Cuenta 2 (Semana B)' : 'Cuenta 1 (Semana A)',
    currentWeekLabel: activeIndex === 0 ? 'Semana de Cuenta 1' : 'Semana de Cuenta 2'
  };
}
