export const MOVES = ['rock', 'paper', 'scissors'] as const;
export type Move = (typeof MOVES)[number];
export type Outcome = 'win' | 'lose' | 'draw';

export const MOVE_LABEL: Record<Move, string> = {
  rock: 'Piedra',
  paper: 'Papel',
  scissors: 'Tijera',
};

const BEATS: Record<Move, Move> = {
  rock: 'scissors',
  scissors: 'paper',
  paper: 'rock',
};

export function counterOf(move: Move): Move {
  return MOVES.find((candidate) => BEATS[candidate] === move) as Move;
}

export function resolveRound(player: Move, machine: Move): Outcome {
  if (player === machine) return 'draw';
  return BEATS[player] === machine ? 'win' : 'lose';
}

export function isMove(value: unknown): value is Move {
  return typeof value === 'string' && (MOVES as readonly string[]).includes(value);
}

export function isOutcome(value: unknown): value is Outcome {
  return value === 'win' || value === 'lose' || value === 'draw';
}
