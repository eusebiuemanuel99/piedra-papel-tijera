import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MOVE_LABEL, type Move, type Outcome } from '../domain/moves';
import { baseStyles } from '../styles/shared';
import './rps-icon';

const RESULT_TAG: Record<Outcome, { text: string; icon: 'check' | 'cross' | 'equal' }> = {
  win: { text: 'Gana', icon: 'check' },
  lose: { text: 'Pierde', icon: 'cross' },
  draw: { text: 'Empate', icon: 'equal' },
};

@customElement('rps-move-tile')
export class RpsMoveTile extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }
      .tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--rps-space-2);
        min-height: 192px;
        padding: var(--rps-space-4) var(--rps-space-2);
        border: var(--rps-border-width) solid var(--rps-border-subtle);
        border-style: dashed;
        border-radius: var(--rps-radius-lg);
        background: var(--rps-bg-canvas);
        text-align: center;
      }
      .tile.filled {
        border-style: solid;
        border-color: var(--rps-border-strong);
        background: var(--rps-bg-surface);
      }
      .tile.win {
        border-color: var(--rps-result-win);
        background: var(--rps-result-win-bg);
      }
      .tile.lose {
        border-color: var(--rps-result-lose);
        background: var(--rps-result-lose-bg);
      }
      .tile.draw {
        border-color: var(--rps-result-draw);
        background: var(--rps-result-draw-bg);
      }
      .owner {
        font-size: 14px;
        line-height: 20px;
        color: var(--rps-text-muted);
      }
      .placeholder {
        width: 72px;
        height: 72px;
        display: grid;
        place-items: center;
        color: var(--rps-text-muted);
      }
      .name {
        font-weight: 700;
        font-size: 16px;
        line-height: 20px;
        color: var(--rps-text-primary);
      }
      .name.muted {
        color: var(--rps-text-muted);
      }
      .tag {
        display: flex;
        align-items: center;
        gap: var(--rps-space-1);
        font-weight: 700;
        font-size: 16px;
        line-height: 20px;
      }
      .tag rps-icon {
        --rps-icon-size: 20px;
      }
      .win .tag {
        color: var(--rps-result-win);
      }
      .lose .tag {
        color: var(--rps-result-lose);
      }
      .draw .tag {
        color: var(--rps-result-draw);
      }
      .reveal {
        animation: pop 220ms ease-out;
      }
      @keyframes pop {
        from {
          transform: scale(0.85);
          opacity: 0;
        }
      }
      .thinking {
        animation: pulse 1s ease-in-out infinite;
      }
      @keyframes pulse {
        50% {
          opacity: 0.45;
        }
      }
    `,
  ];

  @property() owner = 'Tú';
  @property() move?: Move;
  @property({ type: Boolean }) thinking = false;
  @property() result?: Outcome;
  @property({ attribute: 'empty-label' }) emptyLabel = 'Elige una jugada';

  override render() {
    if (this.move) {
      const tag = this.result ? RESULT_TAG[this.result] : undefined;
      return html`<div class="tile filled ${this.result ?? ''}">
        <span class="owner">${this.owner}</span>
        <rps-icon class="reveal" name=${this.move} size="72"></rps-icon>
        <span class="name">${MOVE_LABEL[this.move]}</span>
        ${
          tag
            ? html`<span class="tag"><rps-icon name=${tag.icon}></rps-icon>${tag.text}</span>`
            : nothing
        }
      </div>`;
    }
    if (this.thinking) {
      return html`<div class="tile filled">
        <span class="owner">${this.owner}</span>
        <span class="placeholder thinking"><rps-icon name="question" size="72"></rps-icon></span>
        <span class="name muted">Pensando…</span>
      </div>`;
    }
    return html`<div class="tile">
      <span class="owner">${this.owner}</span>
      <span class="placeholder"></span>
      <span class="name muted">${this.emptyLabel}</span>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-move-tile': RpsMoveTile;
  }
}
