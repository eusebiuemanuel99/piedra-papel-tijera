export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_KEY = 'rps:theme';
export const THEMES: readonly ThemePreference[] = ['system', 'light', 'dark'];

export function getTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return THEMES.includes(stored as ThemePreference) ? (stored as ThemePreference) : 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(
  theme: ThemePreference,
  root: HTMLElement = document.documentElement,
): void {
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

export function setTheme(theme: ThemePreference): void {
  try {
    if (theme === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* sin almacenamiento: el tema solo dura la sesión */
  }
  applyTheme(theme);
}
