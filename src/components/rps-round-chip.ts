import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Outcome } from '../domain/moves';
import { baseStyles } from '../styles/shared';
import './rps-icon';

const ICON = { win: 'check', lose: 'cross', draw: 'equal' } as const;
const WORD: Record<Outcome, string> = { win: 'ganada', lose: 'perdida', draw: 'empatada' };

@customElement('rps-round-chip')
export class RpsRoundChip extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: inline-flex;
      }
      .chip {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        border: var(--rps-border-width) solid;
        border-radius: var(--rps-radius-sm);
      }
      .win {
        background: var(--rps-result-win-bg);
        border-color: var(--rps-result-win);
        color: var(--rps-result-win);
      }
      .lose {
        background: var(--rps-result-lose-bg);
        border-color: var(--rps-result-lose);
        color: var(--rps-result-lose);
      }
      .draw {
        background: var(--rps-result-draw-bg);
        border-color: var(--rps-result-draw);
        color: var(--rps-result-draw);
      }
      rps-icon {
        --rps-icon-size: 20px;
      }
    `,
  ];

  @property() result: Outcome = 'draw';
  @property({ type: Number }) index = 1;

  override render() {
    return html`<span
      class="chip ${this.result}"
      role="img"
      aria-label="Ronda ${this.index}: ${WORD[this.result]}"
    >
      <rps-icon name=${ICON[this.result]}></rps-icon>
    </span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-round-chip': RpsRoundChip;
  }
}
