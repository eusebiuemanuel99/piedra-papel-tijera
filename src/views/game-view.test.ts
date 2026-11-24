import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chooseMachineMove } from '../domain/machine';
import type { Move } from '../domain/moves';
import { gameStore } from '../services/game-store';
import { currentPath, navigate } from '../router';
import { $, $$, mount, resetStore, settle } from '../test/helpers';
import { MACHINE_DELAY_MS, VIBRATE_ON_LOSE_MS } from './game-view';
import type { GameView } from './game-view';
import type { RpsMoveTile } from '../components/rps-move-tile';
import type { RpsMoveButton } from '../components/rps-move-button';
import type { RpsResult } from '../components/rps-result';
import type { RpsRoundChip } from '../components/rps-round-chip';

vi.mock('../domain/machine', () => ({ chooseMachineMove: vi.fn() }));
const machine = vi.mocked(chooseMachineMove);

async function setup() {
  gameStore.login('Marta');
  return mount<GameView>('game-view');
}

const buttons = (view: GameView) => $$<RpsMoveButton>(view, 'rps-move-button');
const tiles = (view: GameView) => $$<RpsMoveTile>(view, 'rps-move-tile');

async function play(view: GameView, move: Move, machineMove: Move, wait = MACHINE_DELAY_MS) {
  machine.mockReturnValueOnce(machineMove);
  const index = ['rock', 'paper', 'scissors'].indexOf(move);
  buttons(view)[index].click();
  await view.updateComplete;
  vi.advanceTimersByTime(wait);
  await view.updateComplete;
}

describe('game-view', () => {
  beforeEach(() => {
    resetStore();
    machine.mockReset();
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      configurable: true,
      writable: true,
    });
  });

  it('muestra el nombre, los puntos, tres jugadas y el botón de salir', async () => {
    const view = await setup();
    const board = $(view, 'rps-scoreboard') as HTMLElement & { name: string; score: number };
    expect(board.name).toBe('Marta');
    expect(board.score).toBe(0);
    expect(buttons(view).map((b) => b.move)).toEqual(['rock', 'paper', 'scissors']);
    expect($(view, 'rps-app-header').getAttribute('back-label')).toBe('Salir');
  });

  it('al elegir, muestra la selección y la máquina espera al menos 1 segundo', async () => {
    const view = await setup();
    machine.mockReturnValueOnce('scissors');
    buttons(view)[0].click();
    await view.updateComplete;

    expect(tiles(view)[0].move).toBe('rock');
    expect(tiles(view)[1].thinking).toBe(true);
    expect(tiles(view)[1].move).toBeUndefined();
    expect(machine).not.toHaveBeenCalled();

    vi.advanceTimersByTime(MACHINE_DELAY_MS - 1);
    await view.updateComplete;
    expect(tiles(view)[1].move).toBeUndefined();

    vi.advanceTimersByTime(1);
    await view.updateComplete;
    expect(tiles(view)[1].move).toBe('scissors');
  });

  it('bloquea las jugadas mientras la máquina piensa', async () => {
    const view = await setup();
    machine.mockReturnValue('rock');
    buttons(view)[0].click();
    await view.updateComplete;
    expect(buttons(view).every((b) => b.disabled)).toBe(true);
    expect(buttons(view)[0].selected).toBe(true);

    buttons(view)[1].click();
    await view.updateComplete;
    vi.advanceTimersByTime(MACHINE_DELAY_MS);
    await view.updateComplete;
    expect(gameStore.currentPlayer?.rounds).toBe(1);
  });

  it('victoria: +1 punto, resultado en pantalla y se guarda', async () => {
    const view = await setup();
    await play(view, 'rock', 'scissors');
    expect($<RpsResult>(view, 'rps-result').outcome).toBe('win');
    expect(tiles(view).map((t) => t.result)).toEqual(['win', 'lose']);
    const board = $(view, 'rps-scoreboard') as HTMLElement & { score: number };
    expect(board.score).toBe(1);
    expect(gameStore.currentPlayer?.score).toBe(1);
    expect(navigator.vibrate).not.toHaveBeenCalled();
  });

  it('derrota: no suma, la máquina puntúa y el dispositivo vibra', async () => {
    const view = await setup();
    await play(view, 'rock', 'paper');
    expect($<RpsResult>(view, 'rps-result').outcome).toBe('lose');
    expect(gameStore.currentPlayer?.score).toBe(0);
    expect(gameStore.machineWins).toBe(1);
    expect(navigator.vibrate).toHaveBeenCalledWith(VIBRATE_ON_LOSE_MS);
  });

  it('empate: nadie puntúa', async () => {
    const view = await setup();
    await play(view, 'paper', 'paper');
    expect($<RpsResult>(view, 'rps-result').outcome).toBe('draw');
    expect(gameStore.currentPlayer?.score).toBe(0);
    expect(gameStore.machineWins).toBe(0);
    expect(tiles(view).map((t) => t.result)).toEqual(['draw', 'draw']);
  });

  it('anuncia el resultado en una región aria-live', async () => {
    const view = await setup();
    await play(view, 'rock', 'scissors');
    expect($(view, '[role="status"]').textContent).toBe(
      'Tú: piedra. Máquina: tijera. Ganas esta ronda.',
    );
  });

  it('"Siguiente ronda" reinicia la arena y vuelve a habilitar las jugadas', async () => {
    const view = await setup();
    await play(view, 'rock', 'scissors');
    expect(buttons(view)).toHaveLength(0);
    $(view, '.next').click();
    await view.updateComplete;
    expect(tiles(view).every((t) => t.move === undefined)).toBe(true);
    expect(buttons(view)).toHaveLength(3);
    expect(buttons(view).every((b) => !b.disabled && !b.selected)).toBe(true);
  });

  it('la máquina decide solo con las jugadas anteriores, no con la actual', async () => {
    const view = await setup();
    await play(view, 'rock', 'rock');
    $(view, '.next').click();
    await view.updateComplete;
    await play(view, 'paper', 'rock');
    expect(machine).toHaveBeenNthCalledWith(1, []);
    expect(machine).toHaveBeenNthCalledWith(2, ['rock']);
  });

  it('muestra las últimas 5 rondas como fichas', async () => {
    const view = await setup();
    expect($(view, '.label-text').textContent?.trim()).toBe('Aún sin rondas');
    const outcomes: [Move, Move][] = [
      ['rock', 'scissors'],
      ['rock', 'paper'],
      ['rock', 'rock'],
      ['rock', 'scissors'],
      ['rock', 'scissors'],
      ['rock', 'paper'],
    ];
    for (const [player, rival] of outcomes) {
      await play(view, player, rival);
      $(view, '.next').click();
      await view.updateComplete;
    }
    const chips = $$<RpsRoundChip>(view, 'rps-round-chip').map((c) => c.result);
    expect(chips).toEqual(['lose', 'draw', 'win', 'win', 'lose']);
  });

  it('Salir cierra la sesión y vuelve a Home', async () => {
    const view = await setup();
    await play(view, 'rock', 'scissors');
    $(view, 'rps-app-header').dispatchEvent(
      new CustomEvent('rps-back', { bubbles: true, composed: true }),
    );
    expect(gameStore.currentPlayer).toBeUndefined();
    expect(currentPath()).toBe('/');
    expect(gameStore.find('marta')?.score).toBe(1);
  });

  it('abandonar a mitad de ronda cancela la jugada pendiente', async () => {
    const view = await setup();
    machine.mockReturnValue('rock');
    buttons(view)[0].click();
    await view.updateComplete;
    view.remove();
    vi.advanceTimersByTime(MACHINE_DELAY_MS * 2);
    expect(gameStore.currentPlayer?.rounds).toBe(0);
  });

  it('el acceso al ranking navega a /ranking', async () => {
    const view = await setup();
    $(view, 'rps-scoreboard').dispatchEvent(
      new CustomEvent('rps-open-ranking', { bubbles: true, composed: true }),
    );
    expect(currentPath()).toBe('/ranking');
    navigate('/');
    await settle(view);
  });
});
