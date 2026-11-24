import { isMove, isOutcome, type Move, type Outcome } from './moves';

export const NAME_MIN = 2;
export const NAME_MAX = 16;
export const RECENT_LIMIT = 5;
export const MOVE_HISTORY_LIMIT = 30;

export interface PlayerRecord {
  name: string;
  score: number;
  rounds: number;
  recent: Outcome[];
  moves: Move[];
}

export interface NameValidation {
  valid: boolean;
  value: string;
  error?: string;
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function playerKey(name: string): string {
  return normalizeName(name).toLocaleLowerCase('es');
}

export function validateName(raw: string): NameValidation {
  const value = normalizeName(raw);
  if (value.length === 0) {
    return { valid: false, value, error: 'Escribe tu nombre para empezar a jugar.' };
  }
  if (value.length < NAME_MIN) {
    return { valid: false, value, error: `Escribe al menos ${NAME_MIN} caracteres.` };
  }
  if (value.length > NAME_MAX) {
    return { valid: false, value, error: `Usa como máximo ${NAME_MAX} caracteres.` };
  }
  if (!/^[\p{L}\p{N} _.-]+$/u.test(value)) {
    return {
      valid: false,
      value,
      error: 'Usa solo letras, números, espacios, guiones o puntos.',
    };
  }
  return { valid: true, value };
}

export function createPlayer(name: string): PlayerRecord {
  return { name: normalizeName(name), score: 0, rounds: 0, recent: [], moves: [] };
}

export function applyRound(player: PlayerRecord, move: Move, outcome: Outcome): PlayerRecord {
  return {
    ...player,
    score: player.score + (outcome === 'win' ? 1 : 0),
    rounds: player.rounds + 1,
    recent: [...player.recent, outcome].slice(-RECENT_LIMIT),
    moves: [...player.moves, move].slice(-MOVE_HISTORY_LIMIT),
  };
}

const toCount = (n: unknown): number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;

export function sanitizePlayer(value: unknown): PlayerRecord | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.name !== 'string' || normalizeName(raw.name).length === 0) return null;
  return {
    name: normalizeName(raw.name),
    score: toCount(raw.score),
    rounds: toCount(raw.rounds),
    recent: Array.isArray(raw.recent) ? raw.recent.filter(isOutcome).slice(-RECENT_LIMIT) : [],
    moves: Array.isArray(raw.moves) ? raw.moves.filter(isMove).slice(-MOVE_HISTORY_LIMIT) : [],
  };
}
