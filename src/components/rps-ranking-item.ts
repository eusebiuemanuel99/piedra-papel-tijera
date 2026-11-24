import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../styles/shared';
import './rps-icon';

@customElement('rps-ranking-item')
export class RpsRankingItem extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }
      .item {
        display: flex;
        align-items: center;
        gap: var(--rps-space-3);
        padding: var(--rps-space-3) var(--rps-space-4);
        border: var(--rps-border-width) solid var(--rps-border-subtle);
        border-radius: var(--rps-radius-md);
        background: var(--rps-bg-surface);
      }
      .item.you {
        background: var(--rps-bg-sunken);
        border-color: var(--rps-border-strong);
      }
      .item.machine {
        border-color: var(--rps-border-strong);
        box-shadow: 0 var(--rps-shadow-offset) 0 var(--rps-border-strong);
      }
      .rank {
        flex: none;
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        border: 2px solid var(--rps-border-strong);
        border-radius: 20px;
        background: var(--rps-bg-canvas);
        font-weight: 700;
        font-size: 16px;
        line-height: 20px;
      }
      .info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .name {
        font-weight: 700;
        font-size: 16px;
        line-height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sub,
      .unit {
        font-size: 14px;
        line-height: 20px;
        color: var(--rps-text-muted);
      }
      .best {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        white-space: nowrap;
      }
      .value {
        font-family: var(--rps-font-display);
        font-weight: 700;
        font-size: 24px;
        line-height: 30px;
      }
    `,
  ];

  @property({ type: Number }) position = 1;
  @property() name = '';
  @property({ type: Number }) score = 0;
  @property() kind: 'player' | 'you' | 'machine' = 'player';
  @property() subtitle = '';
  @property() unit = 'mejor';

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'listitem');
  }

  override willUpdate(): void {
    if (this.kind === 'you') this.setAttribute('aria-current', 'true');
    else this.removeAttribute('aria-current');
  }

  override render() {
    const sub = this.kind === 'you' ? 'Tú' : this.subtitle;
    return html`<div class="item ${this.kind}">
      <span
        class="rank"
        aria-label=${this.kind === 'machine' ? 'Máquina' : `Posición ${this.position}`}
      >
        ${this.kind === 'machine' ? html`<rps-icon name="robot"></rps-icon>` : this.position}
      </span>
      <span class="info">
        <span class="name">${this.name}</span>
        ${sub ? html`<span class="sub">${sub}</span>` : nothing}
      </span>
      <span class="best">
        <span class="value">${this.score}</span>
        <span class="unit">${this.unit}</span>
      </span>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-ranking-item': RpsRankingItem;
  }
}
