import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { chooseMachineMove } from '../domain/machine';
import { MOVES, MOVE_LABEL, resolveRound, type Move, type Outcome } from '../domain/moves';
import { gameStore } from '../services/game-store';
import { StoreController } from '../controllers/store-controller';
import { navigate } from '../router';
import { baseStyles, typography, viewStyles } from '../styles/shared';
import '../components/rps-app-header';
import '../components/rps-button';
import '../components/rps-move-button';
import '../components/rps-move-tile';
import '../components/rps-result';
import '../components/rps-round-chip';
import '../components/rps-scoreboard';
import type { RpsAppHeader } from '../components/rps-app-header';

export const MACHINE_DELAY_MS = 1000;
export const VIBRATE_ON_LOSE_MS = 200;

type Phase = 'idle' | 'thinking' | 'result';

const OUTCOME_SENTENCE: Record<Outcome, string> = {
  win: 'Ganas esta ronda',
  lose: 'Pierdes esta ronda',
  draw: 'Empate',
};

@customElement('game-view')
export class GameView extends LitElement {
  static override styles = [
    baseStyles,
    viewStyles,
    typography,
    css`
      .history {
        display: flex;
        align-items: center;
        gap: var(--rps-space-2);
        min-height: 40px;
      }
      .history .label-text {
        flex: 1;
        font-size: 14px;
        line-height: 20px;
        color: var(--rps-text-muted);
      }
      .history ul {
        display: flex;
        gap: var(--rps-space-2);
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .arena {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--rps-space-4);
      }
      .status {
        margin: 0;
        text-align: center;
      }
      .moves {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--rps-space-3);
      }
    `,
  ];

  machineDelay = MACHINE_DELAY_MS;

  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    super();
    new StoreController(this, gameStore);
  }

  @state() private phase: Phase = 'idle';
  @state() private playerMove?: Move;
  @state() private machineMove?: Move;
  @state() private outcome?: Outcome;

  @query('rps-app-header') private header!: RpsAppHeader;
  @query('.next') private nextButton?: HTMLElement;
  @query('rps-move-button') private firstMove?: HTMLElement;

  focusHeading(): void {
    this.header?.focusTitle();
  }

  override disconnectedCallback(): void {
    clearTimeout(this.timer);
    super.disconnectedCallback();
  }

  private play(move: Move): void {
    if (this.phase !== 'idle') return;
    const player = gameStore.currentPlayer;
    if (!player) return;

    this.playerMove = move;
    this.machineMove = undefined;
    this.outcome = undefined;
    this.phase = 'thinking';

    // La máquina decide solo con jugadas anteriores: nunca ve la actual.
    const history = player.moves;
    this.timer = setTimeout(() => this.resolve(move, history), this.machineDelay);
  }

  private resolve(playerMove: Move, history: readonly Move[]): void {
    const machineMove = chooseMachineMove(history);
    const outcome = resolveRound(playerMove, machineMove);
    this.machineMove = machineMove;
    this.outcome = outcome;
    this.phase = 'result';
    gameStore.recordRound(playerMove, outcome);
    if (outcome === 'lose') navigator.vibrate?.(VIBRATE_ON_LOSE_MS);
  }

  private nextRound(): void {
    this.phase = 'idle';
    this.playerMove = undefined;
    this.machineMove = undefined;
    this.outcome = undefined;
  }

  private exit(): void {
    clearTimeout(this.timer);
    gameStore.logout();
    navigate('/');
  }

  protected override updated(changed: PropertyValues): void {
    if (!changed.has('phase')) return;
    if (this.phase === 'result') this.nextButton?.focus();
    else if (this.phase === 'idle' && changed.get('phase') === 'result') this.firstMove?.focus();
  }

  private get announcement(): string {
    if (this.phase === 'thinking' && this.playerMove) {
      return `Has elegido ${MOVE_LABEL[this.playerMove].toLowerCase()}. La máquina está pensando.`;
    }
    if (this.phase === 'result' && this.playerMove && this.machineMove && this.outcome) {
      return `Tú: ${MOVE_LABEL[this.playerMove].toLowerCase()}. Máquina: ${MOVE_LABEL[this.machineMove].toLowerCase()}. ${OUTCOME_SENTENCE[this.outcome]}.`;
    }
    return '';
  }

  private renderHistory(recent: readonly Outcome[]) {
    return html`<div class="history">
      <span class="label-text" id="history-label">
        ${recent.length ? 'Últimas rondas' : 'Aún sin rondas'}
      </span>
      <ul aria-labelledby="history-label">
        ${recent.map(
          (result, i) =>
            html`<li><rps-round-chip .result=${result} .index=${i + 1}></rps-round-chip></li>`,
        )}
      </ul>
    </div>`;
  }

  private renderStatus() {
    if (this.phase === 'result' && this.outcome) {
      return html`<rps-result .outcome=${this.outcome}></rps-result>`;
    }
    return html`<p class="body-l status">
      ${this.phase === 'thinking' ? 'La máquina está pensando…' : 'Elige piedra, papel o tijera.'}
    </p>`;
  }

  private renderControls() {
    if (this.phase === 'result') {
      return html`<rps-button class="next" @click=${this.nextRound}>Siguiente ronda</rps-button>`;
    }
    const locked = this.phase === 'thinking';
    return html`<div class="moves" role="group" aria-label="Elige tu jugada">
      ${MOVES.map(
        (move) =>
          html`<rps-move-button
            .move=${move}
            .selected=${this.playerMove === move}
            .disabled=${locked}
            @click=${() => this.play(move)}
          ></rps-move-button>`,
      )}
    </div>`;
  }

  override render() {
    const player = gameStore.currentPlayer;
    if (!player) return nothing;
    const outcome = this.phase === 'result' ? this.outcome : undefined;
    const opposite: Record<Outcome, Outcome> = { win: 'lose', lose: 'win', draw: 'draw' };

    return html`
      <rps-app-header heading="Partida" back-label="Salir" @rps-back=${this.exit}></rps-app-header>
      <rps-scoreboard
        .name=${player.name}
        .score=${player.score}
        @rps-open-ranking=${() => navigate('/ranking')}
      ></rps-scoreboard>
      ${this.renderHistory(player.recent)}
      <div class="arena">
        <rps-move-tile
          owner="Tú"
          .move=${this.playerMove}
          .result=${outcome}
          empty-label="Elige una jugada"
        ></rps-move-tile>
        <rps-move-tile
          owner="Máquina"
          .move=${this.machineMove}
          .thinking=${this.phase === 'thinking'}
          .result=${outcome ? opposite[outcome] : undefined}
          empty-label="Esperando"
        ></rps-move-tile>
      </div>
      ${this.renderStatus()}
      <div class="sr-only" role="status" aria-live="polite">${this.announcement}</div>
      <div class="spacer"></div>
      ${this.renderControls()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-view': GameView;
  }
}
