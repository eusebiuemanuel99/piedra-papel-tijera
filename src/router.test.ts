import { describe, expect, it, vi } from 'vitest';
import { NAVIGATE_EVENT, currentPath, navigate, resolveRoute, stripBase, withBase } from './router';

describe('resolveRoute', () => {
  it('"/" muestra Home sin sesión', () => {
    expect(resolveRoute('/', false)).toEqual({ route: 'home' });
  });

  it('"/" con sesión abierta retoma la partida', () => {
    expect(resolveRoute('/', true)).toEqual({ route: 'game', redirect: '/game' });
  });

  it('"/game" exige jugador; si no, redirige a Home', () => {
    expect(resolveRoute('/game', true)).toEqual({ route: 'game' });
    expect(resolveRoute('/game', false)).toEqual({ route: 'home', redirect: '/' });
  });

  it('"/ranking" es accesible con y sin sesión', () => {
    expect(resolveRoute('/ranking', false)).toEqual({ route: 'ranking' });
    expect(resolveRoute('/ranking', true)).toEqual({ route: 'ranking' });
  });

  it('cualquier ruta inexistente redirige a la vista por defecto', () => {
    expect(resolveRoute('/nope', false)).toEqual({ route: 'home', redirect: '/' });
    expect(resolveRoute('/a/b/c', false)).toEqual({ route: 'home', redirect: '/' });
    expect(resolveRoute('/nope', true)).toEqual({ route: 'game', redirect: '/game' });
  });
});

describe('base path', () => {
  it('stripBase quita el prefijo y la barra final', () => {
    expect(stripBase('/app/game/', '/app')).toBe('/game');
    expect(stripBase('/app', '/app')).toBe('/');
    expect(stripBase('/game', '')).toBe('/game');
    expect(stripBase('/', '')).toBe('/');
  });

  it('withBase añade el prefijo', () => {
    expect(withBase('/game', '/app')).toBe('/app/game');
    expect(withBase('/', '')).toBe('/');
  });
});

describe('navigate', () => {
  it('actualiza la URL y emite el evento de navegación', () => {
    const listener = vi.fn();
    window.addEventListener(NAVIGATE_EVENT, listener);
    navigate('/ranking');
    expect(currentPath()).toBe('/ranking');
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(NAVIGATE_EVENT, listener);
  });

  it('no duplica entradas del historial al navegar a la URL actual', () => {
    navigate('/ranking');
    const before = window.history.length;
    navigate('/ranking');
    expect(window.history.length).toBe(before);
  });

  it('replace sustituye la entrada actual', () => {
    navigate('/ranking');
    const before = window.history.length;
    navigate('/', { replace: true });
    expect(window.history.length).toBe(before);
    expect(currentPath()).toBe('/');
  });
});
