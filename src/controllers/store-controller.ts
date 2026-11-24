import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { GameStore } from '../services/game-store';

export class StoreController implements ReactiveController {
  private unsubscribe?: () => void;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly store: GameStore,
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    this.unsubscribe = this.store.subscribe(() => this.host.requestUpdate());
  }

  hostDisconnected(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }
}
