import { beforeEach, describe, expect, it } from 'vitest';
import { gameStore } from '../services/game-store';
import { currentPath } from '../router';
import { $, $$, mount, resetStore } from '../test/helpers';
import './ranking-view';
import type { RankingView } from './ranking-view';
import type { RpsRankingItem } from '../components/rps-ranking-item';

function seed() {
  gameStore.login('Ana');
  for (let i = 0; i < 3; i += 1) gameStore.recordRound('rock', 'win');
  gameStore.recordRound('rock', 'lose');
  gameStore.login('Lucas');
  for (let i = 0; i < 5; i += 1) gameStore.recordRound('rock', 'win');
  gameStore.login('Marta');
  gameStore.recordRound('rock', 'win');
  gameStore.logout();
}

describe('ranking-view', () => {
  beforeEach(() => resetStore());

  it('sin partidas muestra el estado vacío con acción para jugar', async () => {
    const view = await mount<RankingView>('ranking-view');
    expect(view.shadowRoot?.textContent).toContain('Aún no hay partidas');
    expect($$(view, 'rps-ranking-item')).toHaveLength(0);
    $(view, '.empty + rps-button').click();
    expect(currentPath()).toBe('/');
  });

  it('lista a los jugadores ordenados por puntuación máxima', async () => {
    seed();
    const view = await mount<RankingView>('ranking-view');
    const rows = $$<RpsRankingItem>(view, '.list rps-ranking-item');
    expect(rows.map((r) => [r.position, r.name, r.score])).toEqual([
      [1, 'Lucas', 5],
      [2, 'Ana', 3],
      [3, 'Marta', 1],
    ]);
  });

  it('muestra los puntos acumulados de la máquina', async () => {
    seed();
    const view = await mount<RankingView>('ranking-view');
    const machine = $<RpsRankingItem>(view, 'rps-ranking-item[kind="machine"]');
    expect(machine.score).toBe(1);
    expect(machine.unit).toBe('acumulados');
  });

  it('resalta al jugador con sesión abierta', async () => {
    seed();
    gameStore.login('Ana');
    const view = await mount<RankingView>('ranking-view');
    const rows = $$<RpsRankingItem>(view, '.list rps-ranking-item');
    expect(rows.map((r) => r.kind)).toEqual(['player', 'you', 'player']);
  });

  it('usa listas accesibles (role="list" con etiqueta)', async () => {
    seed();
    const view = await mount<RankingView>('ranking-view');
    const list = $(view, '.list');
    expect(list.getAttribute('role')).toBe('list');
    expect(list.getAttribute('aria-labelledby')).toBe('players-heading');
  });

  it('"Volver" lleva a Home sin sesión y a la partida con sesión', async () => {
    seed();
    const view = await mount<RankingView>('ranking-view');
    const back = () =>
      $(view, 'rps-app-header').dispatchEvent(
        new CustomEvent('rps-back', { bubbles: true, composed: true }),
      );
    back();
    expect(currentPath()).toBe('/');
    gameStore.login('Ana');
    back();
    expect(currentPath()).toBe('/game');
  });

  it('se actualiza cuando cambian las puntuaciones', async () => {
    seed();
    const view = await mount<RankingView>('ranking-view');
    gameStore.login('Marta');
    for (let i = 0; i < 9; i += 1) gameStore.recordRound('rock', 'win');
    await view.updateComplete;
    expect($$<RpsRankingItem>(view, '.list rps-ranking-item')[0].name).toBe('Marta');
  });
});
