import { describe, expect, it } from 'vitest';
import {
  MOVES,
  counterOf,
  isMove,
  isOutcome,
  resolveRound,
  type Move,
  type Outcome,
} from './moves';

describe('resolveRound', () => {
  const table: [Move, Move, Outcome][] = [
    ['rock', 'scissors', 'win'],
    ['scissors', 'paper', 'win'],
    ['paper', 'rock', 'win'],
    ['scissors', 'rock', 'lose'],
    ['paper', 'scissors', 'lose'],
    ['rock', 'paper', 'lose'],
    ['rock', 'rock', 'draw'],
    ['paper', 'paper', 'draw'],
    ['scissors', 'scissors', 'draw'],
  ];

  it.each(table)('%s vs %s -> %s', (player, machine, expected) => {
    expect(resolveRound(player, machine)).toBe(expected);
  });
});

describe('counterOf', () => {
  it('devuelve la jugada que vence a la indicada', () => {
    for (const move of MOVES) {
      expect(resolveRound(counterOf(move), move)).toBe('win');
    }
  });
});

describe('guardas de tipo', () => {
  it('isMove', () => {
    expect(isMove('rock')).toBe(true);
    expect(isMove('lizard')).toBe(false);
    expect(isMove(3)).toBe(false);
  });
  it('isOutcome', () => {
    expect(isOutcome('win')).toBe(true);
    expect(isOutcome('tie')).toBe(false);
  });
});
