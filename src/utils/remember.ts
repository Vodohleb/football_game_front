const REMEMBER_KEY = 'football-arena-remember';
const SESSION_KEY = 'football-arena-session';

export function rememberLogin(remember: boolean): void {
  localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0');
  sessionStorage.setItem(SESSION_KEY, '1');
}

export function shouldRestoreSession(): boolean {
  const remembered = localStorage.getItem(REMEMBER_KEY);
  const sessionActive = sessionStorage.getItem(SESSION_KEY);
  return remembered !== '0' || Boolean(sessionActive);
}

export function forgetLogin(): void {
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}
