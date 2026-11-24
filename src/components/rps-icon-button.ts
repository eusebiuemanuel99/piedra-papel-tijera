import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles, focusStyles } from '../styles/shared';
import './rps-icon';
import type { IconName } from './rps-icon';

@customElement('rps-icon-button')
export class RpsIconButton extends LitElement {
  static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles = [
    baseStyles,
    focusStyles,
    css`
      :host {
        display: inline-block;
      }
      button {
        appearance: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        padding: 0;
        border: var(--rps-border-width) solid var(--rps-border-strong);
        border-radius: var(--rps-radius-md);
        background: var(--rps-bg-surface);
        color: var(--rps-text-primary);
        box-shadow: 0 var(--rps-shadow-offset) 0 var(--rps-border-strong);
        cursor: pointer;
        transition:
          transform 80ms ease-out,
          box-shadow 80ms ease-out;
        touch-action: manipulation;
      }
      @media (hover: hover) {
        button:hover {
          background: var(--rps-bg-sunken);
        }
      }
      button:active {
        background: var(--rps-bg-sunken);
        transform: translateY(var(--rps-shadow-offset));
        box-shadow: none;
      }
    `,
  ];

  @property() icon: IconName = 'settings';
  @property() label = '';

  override render() {
    return html`<button type="button" aria-label=${this.label} title=${this.label}>
      <rps-icon name=${this.icon}></rps-icon>
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-icon-button': RpsIconButton;
  }
}
