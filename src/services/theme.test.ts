import { describe, expect, it } from 'vitest';
import { THEME_KEY, applyTheme, getTheme, setTheme } from './theme';

describe('theme', () => {
  it('por defecto sigue al sistema', () => {
    expect(getTheme()).toBe('system');
  });

  it('persiste la preferencia y la refleja en <html data-theme>', () => {
    setTheme('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(getTheme()).toBe('dark');
  });

  it('"system" elimina la preferencia y el atributo', () => {
    setTheme('light');
    setTheme('system');
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('ignora valores guardados no válidos', () => {
    localStorage.setItem(THEME_KEY, 'neon');
    expect(getTheme()).toBe('system');
  });

  it('applyTheme acepta otro elemento raíz', () => {
    const root = document.createElement('div');
    applyTheme('dark', root);
    expect(root.dataset.theme).toBe('dark');
  });
});
