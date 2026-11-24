import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles, focusStyles } from '../styles/shared';
import './rps-icon';

@customElement('rps-scoreboard')
export class RpsScoreboard extends LitElement {
  static override styles = [
    baseStyles,
    focusStyles,
    css`
      :host {
        display: block;
      }
      .card {
        display: flex;
        flex-direction: column;
        gap: var(--rps-space-3);
        padding: var(--rps-space-4);
        border: var(--rps-border-width) solid var(--rps-border-strong);
        border-radius: var(--rps-radius-lg);
        background: var(--rps-bg-surface);
      }
      .summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--rps-space-3);
      }
      .player,
      .points {
        display: flex;
        flex-direction: column;
        gap: var(--rps-space-1);
        min-width: 0;
      }
      .points {
        align-items: flex-end;
      }
      .caption {
        font-size: 14px;
        line-height: 20px;
        color: var(--rps-text-muted);
      }
      .name {
        font-family: var(--rps-font-display);
        font-weight: 700;
        font-size: 24px;
        line-height: 30px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .score {
        font-family: var(--rps-font-display);
        font-weight: 800;
        font-size: 64px;
        line-height: 64px;
      }
      .ranking-link {
        appearance: none;
        display: flex;
        align-items: center;
        gap: var(--rps-space-2);
        width: 100%;
        min-height: 48px;
        padding: 0;
        border: 0;
        border-top: var(--rps-border-width) solid var(--rps-border-subtle);
        background: none;
        color: var(--rps-text-primary);
        font: 700 16px/20px var(--rps-font-body);
        text-align: left;
        cursor: pointer;
      }
      .ranking-link span {
        flex: 1;
      }
      .chevron {
        display: inline-flex;
        transform: rotate(180deg);
      }
      .ranking-link:focus-visible {
        outline-offset: 0;
        border-radius: var(--rps-radius-sm);
      }
    `,
  ];

  @property() name = '';
  @property({ type: Number }) score = 0;

  private openRanking(): void {
    this.dispatchEvent(new CustomEvent('rps-open-ranking', { bubbles: true, composed: true }));
  }

  override render() {
    return html`<section class="card" aria-label="Marcador">
      <div class="summary">
        <div class="player">
          <span class="caption">Jugador</span>
          <span class="name">${this.name}</span>
        </div>
        <div class="points">
          <span class="caption">Puntos</span>
          <span class="score" aria-live="polite" aria-atomic="true">${this.score}</span>
        </div>
      </div>
      <button class="ranking-link" type="button" @click=${this.openRanking}>
        <rps-icon name="podium"></rps-icon>
        <span>Ver ranking</span>
        <rps-icon class="chevron" name="back"></rps-icon>
      </button>
    </section>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-scoreboard': RpsScoreboard;
  }
}
