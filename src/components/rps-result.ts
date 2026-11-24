import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Outcome } from '../domain/moves';
import { baseStyles } from '../styles/shared';
import './rps-icon';

export const RESULT_COPY: Record<
  Outcome,
  { title: string; detail: string; icon: 'check' | 'cross' | 'equal' }
> = {
  win: { title: 'Ganas esta ronda', detail: '+1 punto', icon: 'check' },
  lose: { title: 'Pierdes esta ronda', detail: 'Punto para la máquina', icon: 'cross' },
  draw: { title: 'Empate', detail: 'Nadie suma puntos', icon: 'equal' },
};

@customElement('rps-result')
export class RpsResult extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }
      .result {
        display: flex;
        align-items: center;
        gap: var(--rps-space-3);
        min-height: 72px;
        padding: var(--rps-space-4);
        border: var(--rps-border-width) solid;
        border-radius: var(--rps-radius-md);
      }
      .win {
        background: var(--rps-result-win-bg);
        border-color: var(--rps-result-win);
        --tone: var(--rps-result-win);
      }
      .lose {
        background: var(--rps-result-lose-bg);
        border-color: var(--rps-result-lose);
        --tone: var(--rps-result-lose);
      }
      .draw {
        background: var(--rps-result-draw-bg);
        border-color: var(--rps-result-draw);
        --tone: var(--rps-result-draw);
      }
      rps-icon {
        --rps-icon-size: 32px;
        color: var(--tone);
      }
      .title {
        margin: 0;
        font-family: var(--rps-font-display);
        font-weight: 700;
        font-size: 24px;
        line-height: 30px;
        color: var(--rps-text-primary);
      }
      .detail {
        margin: 0;
        font-size: 16px;
        line-height: 24px;
        color: var(--rps-text-primary);
      }
    `,
  ];

  @property() outcome: Outcome = 'draw';

  override render() {
    const copy = RESULT_COPY[this.outcome];
    return html`<div class="result ${this.outcome}">
      <rps-icon name=${copy.icon}></rps-icon>
      <div>
        <p class="title">${copy.title}</p>
        <p class="detail">${copy.detail}</p>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-result': RpsResult;
  }
}
