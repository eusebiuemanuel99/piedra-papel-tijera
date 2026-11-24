import { describe, expect, it, vi } from 'vitest';
import { GameStore } from './game-store';
import { STORAGE_KEY } from './storage';

describe('GameStore', () => {
  it('crea un jugador nuevo al iniciar sesión', () => {
    const store = new GameStore();
    const { player, existed } = store.login('  Marta ');
    expect(existed).toBe(false);
    expect(player).toMatchObject({ name: 'Marta', score: 0 });
    expect(store.currentPlayer?.name).toBe('Marta');
  });

  it('continúa la partida si el nombre ya existía (sin distinguir mayúsculas)', () => {
    const store = new GameStore();
    store.login('Marta');
    store.recordRound('rock', 'win');
    store.recordRound('rock', 'win');
    store.logout();
    expect(store.currentPlayer).toBeUndefined();

    const { player, existed } = store.login('MARTA');
    expect(existed).toBe(true);
    expect(player.score).toBe(2);
  });

  it('persiste y restaura el estado al "reabrir" la app', () => {
    const first = new GameStore();
    first.login('Ana');
    first.recordRound('paper', 'win');
    first.recordRound('paper', 'lose');

    const reopened = new GameStore();
    expect(reopened.currentPlayer).toMatchObject({ name: 'Ana', score: 1, rounds: 2 });
    expect(reopened.machineWins).toBe(1);
  });

  it('acumula los puntos de la máquina solo cuando el jugador pierde', () => {
    const store = new GameStore();
    store.login('Ana');
    store.recordRound('rock', 'lose');
    store.recordRound('rock', 'draw');
    store.recordRound('rock', 'win');
    store.login('Lucas');
    store.recordRound('rock', 'lose');
    expect(store.machineWins).toBe(2);
  });

  it('recordRound sin sesión no hace nada', () => {
    const store = new GameStore();
    store.recordRound('rock', 'win');
    expect(store.ranking()).toEqual([]);
    expect(store.machineWins).toBe(0);
  });

  it('ordena el ranking por puntuación y, a igualdad, por nombre', () => {
    const store = new GameStore();
    store.login('Zoe');
    store.recordRound('rock', 'win');
    store.login('Ana');
    store.recordRound('rock', 'win');
    store.login('Lucas');
    store.recordRound('rock', 'win');
    store.recordRound('rock', 'win');
    expect(store.ranking().map((p) => [p.name, p.score])).toEqual([
      ['Lucas', 2],
      ['Ana', 1],
      ['Zoe', 1],
    ]);
  });

  it('notifica a los suscriptores y permite darse de baja', () => {
    const store = new GameStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.login('Ana');
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.logout();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('se sincroniza cuando otra pestaña modifica el almacenamiento', () => {
    const store = new GameStore();
    const listener = vi.fn();
    store.subscribe(listener);
    const other = new GameStore();
    other.login('Eva');
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    expect(store.find('eva')?.name).toBe('Eva');
    expect(listener).toHaveBeenCalled();
  });
});
