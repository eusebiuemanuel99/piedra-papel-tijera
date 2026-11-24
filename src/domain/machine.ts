import { MOVES, counterOf, type Move } from './moves';

export type Rng = () => number;

export const MIN_HISTORY = 3;
export const EXPLORATION = 0.3;

function pickRandom(rng: Rng): Move {
  return MOVES[Math.floor(rng() * MOVES.length)];
}

function argmax(scores: Record<Move, number>, rng: Rng): Move {
  const best = Math.max(...MOVES.map((m) => scores[m]));
  const top = MOVES.filter((m) => scores[m] === best);
  return top[Math.floor(rng() * top.length)];
}

export function predictPlayerMove(history: readonly Move[], rng: Rng = Math.random): Move {
  const frequency: Record<Move, number> = { rock: 0, paper: 0, scissors: 0 };
  for (const move of history) frequency[move] += 1;

  const last = history[history.length - 1];
  const transitions: Record<Move, number> = { rock: 0, paper: 0, scissors: 0 };
  for (let i = 0; i < history.length - 1; i += 1) {
    if (history[i] === last) transitions[history[i + 1]] += 1;
  }
  const observed = MOVES.reduce((sum, m) => sum + transitions[m], 0);

  return argmax(observed >= 2 ? transitions : frequency, rng);
}

export function chooseMachineMove(history: readonly Move[], rng: Rng = Math.random): Move {
  if (history.length < MIN_HISTORY || rng() < EXPLORATION) return pickRandom(rng);
  return counterOf(predictPlayerMove(history, rng));
}
