import { playerKey, sanitizePlayer, type PlayerRecord } from '../domain/player';

export const STORAGE_KEY = 'rps:data:v1';

export interface AppData {
  version: 1;
  players: Record<string, PlayerRecord>;
  machineWins: number;
  currentPlayer: string | null;
}

export function emptyData(): AppData {
  return { version: 1, players: {}, machineWins: 0, currentPlayer: null };
}

export function safeStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function loadData(storage: Storage | undefined = safeStorage()): AppData {
  if (!storage) return emptyData();
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null');
    if (typeof parsed !== 'object' || parsed === null) return emptyData();
    const raw = parsed as Record<string, unknown>;
    const players: Record<string, PlayerRecord> = {};
    if (typeof raw.players === 'object' && raw.players !== null) {
      for (const value of Object.values(raw.players)) {
        const player = sanitizePlayer(value);
        if (player) players[playerKey(player.name)] = player;
      }
    }
    const wins = raw.machineWins;
    const machineWins =
      typeof wins === 'number' && Number.isFinite(wins) && wins >= 0 ? Math.floor(wins) : 0;
    const current = typeof raw.currentPlayer === 'string' ? raw.currentPlayer : null;
    return {
      version: 1,
      players,
      machineWins,
      currentPlayer: current !== null && current in players ? current : null,
    };
  } catch {
    return emptyData();
  }
}

export function saveData(data: AppData, storage: Storage | undefined = safeStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
