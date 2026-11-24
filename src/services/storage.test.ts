import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, emptyData, loadData, saveData } from './storage';

describe('storage', () => {
  it('devuelve datos vacíos si no hay nada guardado', () => {
    expect(loadData()).toEqual(emptyData());
  });

  it('guarda y recupera los datos', () => {
    const data = {
      ...emptyData(),
      machineWins: 4,
      currentPlayer: 'marta',
      players: {
        marta: {
          name: 'Marta',
          score: 3,
          rounds: 5,
          recent: ['win' as const],
          moves: ['rock' as const],
        },
      },
    };
    expect(saveData(data)).toBe(true);
    expect(loadData()).toEqual(data);
  });

  it('ignora JSON corrupto', () => {
    localStorage.setItem(STORAGE_KEY, '{no es json');
    expect(loadData()).toEqual(emptyData());
  });

  it('sanea jugadores inválidos y una sesión que apunta a un jugador inexistente', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        players: { a: { name: 'Ana', score: 2 }, b: 'basura', c: { name: '' } },
        machineWins: -1,
        currentPlayer: 'fantasma',
      }),
    );
    const data = loadData();
    expect(Object.keys(data.players)).toEqual(['ana']);
    expect(data.machineWins).toBe(0);
    expect(data.currentPlayer).toBeNull();
  });

  it('saveData devuelve false si el almacenamiento falla', () => {
    const failing = {
      setItem() {
        throw new Error('QuotaExceeded');
      },
    } as unknown as Storage;
    expect(saveData(emptyData(), failing)).toBe(false);
  });
});
