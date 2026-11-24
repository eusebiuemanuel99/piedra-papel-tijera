import { LitElement, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { gameStore } from '../services/game-store';
import { StoreController } from '../controllers/store-controller';
import { navigate } from '../router';
import { baseStyles, typography, viewStyles } from '../styles/shared';
import '../components/rps-app-header';
import '../components/rps-button';
import '../components/rps-icon';
import '../components/rps-offline-banner';
import '../components/rps-ranking-item';
import type { RpsAppHeader } from '../components/rps-app-header';

@customElement('ranking-view')
export class RankingView extends LitElement {
  static override styles = [
    baseStyles,
    viewStyles,
    typography,
    css`
      .lead {
        color: var(--rps-text-muted);
      }
      h2 {
        margin: 0;
        font-size: 16px;
        line-height: 20px;
        font-weight: 700;
        color: var(--rps-text-muted);
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: var(--rps-space-3);
      }
      .empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--rps-space-4);
        text-align: center;
      }
      .empty rps-icon {
        --rps-icon-size: 96px;
      }
      .empty p {
        color: var(--rps-text-muted);
      }
    `,
  ];

  constructor() {
    super();
    new StoreController(this, gameStore);
  }

  @query('rps-app-header') private header!: RpsAppHeader;

  focusHeading(): void {
    this.header?.focusTitle();
  }

  private back(): void {
    navigate(gameStore.currentPlayer ? '/game' : '/');
  }

  private renderEmpty() {
    return html`<div class="empty">
        <rps-icon name="podium"></rps-icon>
        <h2
          class="heading-m"
          style="color: var(--rps-text-primary); font-size: 24px; line-height: 30px;"
        >
          Aún no hay partidas
        </h2>
        <p class="body-l">Juega una ronda y aparecerás aquí con tu mejor puntuación.</p>
      </div>
      <rps-button @click=${() => navigate('/')}>Ir a jugar</rps-button>`;
  }

  override render() {
    const players = gameStore.ranking();
    const current = gameStore.currentPlayer;

    return html`
      <rps-app-header heading="Ranking" back-label="Volver" @rps-back=${this.back}></rps-app-header>
      <rps-offline-banner></rps-offline-banner>
      ${
        players.length === 0
          ? this.renderEmpty()
          : html`
              <p class="body-l lead">Puntuaciones guardadas en este dispositivo.</p>
              <h2 id="machine-heading">La máquina</h2>
              <div role="list" aria-labelledby="machine-heading">
                <rps-ranking-item
                  kind="machine"
                  name="Máquina"
                  subtitle="Ganados a jugadores"
                  unit="acumulados"
                  .score=${gameStore.machineWins}
                ></rps-ranking-item>
              </div>
              <h2 id="players-heading">Jugadores · mejor puntuación</h2>
              <div class="list" role="list" aria-labelledby="players-heading">
                ${players.map(
                  (player, i) =>
                    html`<rps-ranking-item
                      .kind=${current?.name === player.name ? 'you' : 'player'}
                      .position=${i + 1}
                      .name=${player.name}
                      .score=${player.score}
                    ></rps-ranking-item>`,
                )}
              </div>
            `
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ranking-view': RankingView;
  }
}
