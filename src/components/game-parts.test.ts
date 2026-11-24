import { describe, expect, it, vi } from 'vitest';
import { $, $$, mount } from '../test/helpers';
import './rps-app-header';
import './rps-move-tile';
import './rps-offline-banner';
import './rps-ranking-item';
import './rps-result';
import './rps-round-chip';
import './rps-scoreboard';
import type { RpsAppHeader } from './rps-app-header';
import type { RpsMoveTile } from './rps-move-tile';
import type { RpsOfflineBanner } from './rps-offline-banner';
import type { RpsRankingItem } from './rps-ranking-item';
import type { RpsResult } from './rps-result';
import type { RpsRoundChip } from './rps-round-chip';
import type { RpsScoreboard } from './rps-scoreboard';

describe('rps-move-tile', () => {
  it('vacía: borde discontinuo y texto de espera', async () => {
    const tile = await mount<RpsMoveTile>('rps-move-tile', {
      owner: 'Máquina',
      emptyLabel: 'Esperando',
    });
    expect($(tile, '.tile').classList.contains('filled')).toBe(false);
    expect(tile.shadowRoot?.textContent).toContain('Máquina');
    expect(tile.shadowRoot?.textContent).toContain('Esperando');
  });

  it('pensando: oculta la jugada de la máquina', async () => {
    const tile = await mount<RpsMoveTile>('rps-move-tile', { owner: 'Máquina', thinking: true });
    expect(tile.shadowRoot?.textContent).toContain('Pensando');
    expect($(tile, 'rps-icon').getAttribute('name')).toBe('question');
  });

  it.each([
    ['win', 'Gana'],
    ['lose', 'Pierde'],
    ['draw', 'Empate'],
  ] as const)(
    'con jugada y resultado %s muestra etiqueta de texto (no solo color)',
    async (result, text) => {
      const tile = await mount<RpsMoveTile>('rps-move-tile', { move: 'rock', result });
      expect($(tile, '.tile').classList.contains(result)).toBe(true);
      expect($(tile, '.tag').textContent).toContain(text);
      expect(tile.shadowRoot?.textContent).toContain('Piedra');
    },
  );
});

describe('rps-result', () => {
  it.each([
    ['win', 'Ganas esta ronda', '+1 punto'],
    ['lose', 'Pierdes esta ronda', 'Punto para la máquina'],
    ['draw', 'Empate', 'Nadie suma puntos'],
  ] as const)('resultado %s', async (outcome, title, detail) => {
    const result = await mount<RpsResult>('rps-result', { outcome });
    expect($(result, '.title').textContent).toBe(title);
    expect($(result, '.detail').textContent).toBe(detail);
    expect($(result, '.result').classList.contains(outcome)).toBe(true);
  });
});

describe('rps-round-chip', () => {
  it('describe la ronda para lectores de pantalla', async () => {
    const chip = await mount<RpsRoundChip>('rps-round-chip', { result: 'win', index: 3 });
    const el = $(chip, '.chip');
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Ronda 3: ganada');
    expect($(chip, 'rps-icon').getAttribute('name')).toBe('check');
  });

  it('usa icono distinto por resultado', async () => {
    const lose = await mount<RpsRoundChip>('rps-round-chip', { result: 'lose' });
    const draw = await mount<RpsRoundChip>('rps-round-chip', { result: 'draw' });
    expect($(lose, 'rps-icon').getAttribute('name')).toBe('cross');
    expect($(draw, 'rps-icon').getAttribute('name')).toBe('equal');
  });
});

describe('rps-scoreboard', () => {
  it('muestra nombre y puntos en una región aria-live', async () => {
    const board = await mount<RpsScoreboard>('rps-scoreboard', { name: 'Marta', score: 12 });
    expect($(board, '.name').textContent).toBe('Marta');
    const score = $(board, '.score');
    expect(score.textContent).toBe('12');
    expect(score.getAttribute('aria-live')).toBe('polite');
  });

  it('el acceso al ranking emite rps-open-ranking', async () => {
    const board = await mount<RpsScoreboard>('rps-scoreboard');
    const onOpen = vi.fn();
    board.addEventListener('rps-open-ranking', onOpen);
    $(board, '.ranking-link').click();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

describe('rps-app-header', () => {
  it('renderiza h1 y botón de retorno que emite rps-back', async () => {
    const header = await mount<RpsAppHeader>('rps-app-header', {
      heading: 'Partida',
      backLabel: 'Salir',
    });
    expect($(header, 'h1').textContent).toBe('Partida');
    expect($(header, 'rps-button').textContent).toBe('Salir');
    const onBack = vi.fn();
    header.addEventListener('rps-back', onBack);
    $(header, 'rps-button').click();
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe('rps-ranking-item', () => {
  it('es un listitem y muestra posición, nombre y puntos', async () => {
    const item = await mount<RpsRankingItem>('rps-ranking-item', {
      position: 2,
      name: 'Ana',
      score: 27,
    });
    expect(item.getAttribute('role')).toBe('listitem');
    expect(item.shadowRoot?.textContent).toContain('2');
    expect($(item, '.name').textContent).toBe('Ana');
    expect($(item, '.value').textContent).toBe('27');
    expect(item.hasAttribute('aria-current')).toBe(false);
  });

  it('el jugador actual lleva aria-current y la etiqueta "Tú"', async () => {
    const item = await mount<RpsRankingItem>('rps-ranking-item', {
      kind: 'you',
      name: 'Marta',
      score: 3,
    });
    expect(item.getAttribute('aria-current')).toBe('true');
    expect($(item, '.sub').textContent).toBe('Tú');
  });

  it('la máquina muestra icono de robot y su subtítulo', async () => {
    const item = await mount<RpsRankingItem>('rps-ranking-item', {
      kind: 'machine',
      name: 'Máquina',
      subtitle: 'Ganados a jugadores',
      unit: 'acumulados',
      score: 58,
    });
    expect($(item, '.rank rps-icon').getAttribute('name')).toBe('robot');
    expect($(item, '.sub').textContent).toBe('Ganados a jugadores');
    expect($(item, '.unit').textContent).toBe('acumulados');
  });
});

describe('rps-offline-banner', () => {
  it('se oculta con conexión y aparece al quedarse offline', async () => {
    const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const banner = await mount<RpsOfflineBanner>('rps-offline-banner');
    expect($$(banner, '.banner')).toHaveLength(0);

    online.mockReturnValue(false);
    window.dispatchEvent(new Event('offline'));
    await banner.updateComplete;
    expect($$(banner, '.banner')).toHaveLength(1);
    expect($(banner, '[role="status"]').textContent).toContain('Sin conexión');

    online.mockReturnValue(true);
    window.dispatchEvent(new Event('online'));
    await banner.updateComplete;
    expect($$(banner, '.banner')).toHaveLength(0);
  });
});
