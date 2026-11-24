import { describe, expect, it } from 'vitest';
import {
  MOVE_HISTORY_LIMIT,
  RECENT_LIMIT,
  applyRound,
  createPlayer,
  normalizeName,
  playerKey,
  sanitizePlayer,
  validateName,
} from './player';

describe('validateName', () => {
  it('acepta nombres válidos y los normaliza', () => {
    expect(validateName('  Marta  ')).toEqual({ valid: true, value: 'Marta' });
    expect(validateName('Ana   María').value).toBe('Ana María');
    expect(validateName('Iván-2').valid).toBe(true);
  });

  it('rechaza vacío, demasiado corto, demasiado largo y caracteres raros', () => {
    expect(validateName('   ').error).toMatch(/Escribe tu nombre/);
    expect(validateName('M').error).toBe('Escribe al menos 2 caracteres.');
    expect(validateName('x'.repeat(17)).error).toMatch(/máximo 16/);
    expect(validateName('<b>hola</b>').valid).toBe(false);
    expect(validateName('Marta!').valid).toBe(false);
  });
});

describe('claves de jugador', () => {
  it('no distingue mayúsculas ni espacios sobrantes', () => {
    expect(playerKey(' MARTA ')).toBe(playerKey('marta'));
    expect(normalizeName(' a   b ')).toBe('a b');
  });
});

describe('applyRound', () => {
  it('suma un punto solo al ganar', () => {
    let p = createPlayer('Marta');
    p = applyRound(p, 'rock', 'win');
    p = applyRound(p, 'paper', 'lose');
    p = applyRound(p, 'paper', 'draw');
    expect(p.score).toBe(1);
    expect(p.rounds).toBe(3);
    expect(p.recent).toEqual(['win', 'lose', 'draw']);
  });

  it('limita los historiales', () => {
    let p = createPlayer('Marta');
    for (let i = 0; i < 50; i += 1) p = applyRound(p, 'rock', 'win');
    expect(p.recent).toHaveLength(RECENT_LIMIT);
    expect(p.moves).toHaveLength(MOVE_HISTORY_LIMIT);
  });

  it('no muta el jugador original', () => {
    const p = createPlayer('Marta');
    applyRound(p, 'rock', 'win');
    expect(p.score).toBe(0);
  });
});

describe('sanitizePlayer', () => {
  it('descarta datos inválidos', () => {
    expect(sanitizePlayer(null)).toBeNull();
    expect(sanitizePlayer({ name: '' })).toBeNull();
    expect(sanitizePlayer({ name: 5 })).toBeNull();
  });

  it('corrige campos corruptos', () => {
    const p = sanitizePlayer({
      name: 'Ana',
      score: -3,
      rounds: 'x',
      recent: ['win', 'x'],
      moves: ['rock', 1],
    });
    expect(p).toEqual({ name: 'Ana', score: 0, rounds: 0, recent: ['win'], moves: ['rock'] });
  });
});
