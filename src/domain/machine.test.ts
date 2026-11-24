import { describe, expect, it } from 'vitest';
import { EXPLORATION, MIN_HISTORY, chooseMachineMove, predictPlayerMove } from './machine';
import { MOVES, counterOf, resolveRound, type Move } from './moves';

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('predictPlayerMove', () => {
  it('predice la jugada más frecuente', () => {
    expect(predictPlayerMove(['rock', 'rock', 'paper', 'rock', 'scissors'], seeded(1))).toBe(
      'rock',
    );
  });

  it('usa la transición tras la última jugada cuando hay patrón', () => {
    const history: Move[] = ['rock', 'paper', 'rock', 'paper', 'rock', 'paper', 'rock'];
    expect(predictPlayerMove(history, seeded(1))).toBe('paper');
  });
});

describe('chooseMachineMove', () => {
  it('con poco historial juega al azar según el rng', () => {
    const history: Move[] = ['rock', 'rock'];
    expect(history.length).toBeLessThan(MIN_HISTORY);
    expect(chooseMachineMove(history, () => 0)).toBe('rock');
    expect(chooseMachineMove(history, () => 0.5)).toBe('paper');
    expect(chooseMachineMove(history, () => 0.99)).toBe('scissors');
  });

  it('sin exploración juega lo que vence a la jugada predicha', () => {
    const history: Move[] = ['rock', 'rock', 'rock', 'rock'];
    expect(chooseMachineMove(history, () => EXPLORATION + 0.01)).toBe(counterOf('rock'));
  });

  it('siempre devuelve una jugada válida y no es constante entre rondas', () => {
    const rng = seeded(42);
    const history: Move[] = [];
    const seen = new Set<Move>();
    for (let i = 0; i < 60; i += 1) {
      const move = chooseMachineMove(history, rng);
      expect(MOVES).toContain(move);
      seen.add(move);
      history.push(MOVES[Math.floor(rng() * 3)]);
    }
    expect(seen.size).toBe(3);
  });

  it('gana con más frecuencia que el azar a un jugador predecible', () => {
    const rng = seeded(7);
    const history: Move[] = [];
    let machineWins = 0;
    const rounds = 400;
    for (let i = 0; i < rounds; i += 1) {
      const player: Move = 'rock';
      const machine = chooseMachineMove(history, rng);
      if (resolveRound(player, machine) === 'lose') machineWins += 1;
      history.push(player);
    }
    expect(machineWins / rounds).toBeGreaterThan(0.6);
  });
});
