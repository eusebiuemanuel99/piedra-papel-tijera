import type { Move, Outcome } from '../domain/moves';
import {
  applyRound,
  createPlayer,
  normalizeName,
  playerKey,
  type PlayerRecord,
} from '../domain/player';
import { STORAGE_KEY, loadData, safeStorage, saveData, type AppData } from './storage';

type Listener = () => void;

export class GameStore {
  private data: AppData;
  private readonly listeners = new Set<Listener>();

  constructor(private readonly storage: Storage | undefined = safeStorage()) {
    this.data = loadData(storage);
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY || event.key === null) this.reload();
      });
    }
  }

  reload(): void {
    this.data = loadData(this.storage);
    this.emit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get machineWins(): number {
    return this.data.machineWins;
  }

  get currentPlayer(): PlayerRecord | undefined {
    return this.data.currentPlayer ? this.data.players[this.data.currentPlayer] : undefined;
  }

  find(name: string): PlayerRecord | undefined {
    return this.data.players[playerKey(name)];
  }

  login(name: string): { player: PlayerRecord; existed: boolean } {
    const key = playerKey(name);
    const existing = this.data.players[key];
    const player = existing ?? createPlayer(normalizeName(name));
    this.data = {
      ...this.data,
      players: { ...this.data.players, [key]: player },
      currentPlayer: key,
    };
    this.commit();
    return { player, existed: existing !== undefined };
  }

  logout(): void {
    if (this.data.currentPlayer === null) return;
    this.data = { ...this.data, currentPlayer: null };
    this.commit();
  }

  recordRound(move: Move, outcome: Outcome): void {
    const key = this.data.currentPlayer;
    if (key === null) return;
    this.data = {
      ...this.data,
      players: { ...this.data.players, [key]: applyRound(this.data.players[key], move, outcome) },
      machineWins: this.data.machineWins + (outcome === 'lose' ? 1 : 0),
    };
    this.commit();
  }

  ranking(): PlayerRecord[] {
    return Object.values(this.data.players).sort(
      (a, b) => b.score - a.score || a.name.localeCompare(b.name, 'es'),
    );
  }

  private commit(): void {
    saveData(this.data, this.storage);
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const gameStore = new GameStore();
