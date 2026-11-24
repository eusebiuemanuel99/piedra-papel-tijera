import { beforeEach, describe, expect, it } from 'vitest';
import { gameStore } from './services/game-store';
import { currentPath, navigate } from './router';
import { $, mount, resetStore } from './test/helpers';
import './rps-app';
import type { RpsApp } from './rps-app';

const visible = (app: RpsApp) =>
  ['home-view', 'game-view', 'ranking-view'].find((tag) => app.shadowRoot?.querySelector(tag));

describe('rps-app (rutas)', () => {
  beforeEach(() => resetStore());

  it('la ruta por defecto es Home', async () => {
    const app = await mount<RpsApp>('rps-app');
    expect(visible(app)).toBe('home-view');
    expect(document.title).toBe('Piedra, papel o tijera');
  });

  it.each(['/no-existe', '/game/extra', '/ranking/1', '/foo/bar'])(
    'una ruta inexistente (%s) redirige a Home',
    async (path) => {
      window.history.replaceState(null, '', path);
      const app = await mount<RpsApp>('rps-app');
      expect(currentPath()).toBe('/');
      expect(visible(app)).toBe('home-view');
    },
  );

  it('/game sin jugador redirige a Home', async () => {
    window.history.replaceState(null, '', '/game');
    const app = await mount<RpsApp>('rps-app');
    expect(currentPath()).toBe('/');
    expect(visible(app)).toBe('home-view');
  });

  it('crear un jugador desde Home lleva a la vista de juego', async () => {
    const app = await mount<RpsApp>('rps-app');
    gameStore.login('Marta');
    await app.updateComplete;
    expect(currentPath()).toBe('/game');
    expect(visible(app)).toBe('game-view');
    expect(document.title).toContain('Partida');
  });

  it('al reabrir la app con una sesión guardada se retoma la partida', async () => {
    gameStore.login('Marta');
    window.history.replaceState(null, '', '/');
    const app = await mount<RpsApp>('rps-app');
    expect(currentPath()).toBe('/game');
    expect(visible(app)).toBe('game-view');
  });

  it('salir de la partida vuelve a Home', async () => {
    gameStore.login('Marta');
    const app = await mount<RpsApp>('rps-app');
    const game = $(app, 'game-view');
    $(game, 'rps-app-header').dispatchEvent(
      new CustomEvent('rps-back', { bubbles: true, composed: true }),
    );
    await app.updateComplete;
    expect(currentPath()).toBe('/');
    expect(visible(app)).toBe('home-view');
  });

  it('navega al ranking y responde a popstate', async () => {
    const app = await mount<RpsApp>('rps-app');
    navigate('/ranking');
    await app.updateComplete;
    expect(visible(app)).toBe('ranking-view');
    expect(document.title).toContain('Ranking');

    window.history.replaceState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await app.updateComplete;
    expect(visible(app)).toBe('home-view');
  });

  it('el ranking es accesible con una sesión abierta', async () => {
    gameStore.login('Marta');
    window.history.replaceState(null, '', '/ranking');
    const app = await mount<RpsApp>('rps-app');
    expect(visible(app)).toBe('ranking-view');
  });
});
