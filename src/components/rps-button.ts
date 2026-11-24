import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles, focusStyles } from '../styles/shared';

@customElement('rps-button')
export class RpsButton extends LitElement {
  static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles = [
    baseStyles,
    focusStyles,
    css`
      :host {
        display: block;
        min-width: 140px;
      }
      button {
        appearance: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 56px;
        padding: var(--rps-space-4) var(--rps-space-6);
        border: var(--rps-border-width) solid var(--rps-border-strong);
        border-radius: var(--rps-radius-md);
        box-shadow: 0 var(--rps-shadow-offset) 0 var(--rps-border-strong);
        font: 700 16px/20px var(--rps-font-body);
        cursor: pointer;
        transition:
          transform 80ms ease-out,
          box-shadow 80ms ease-out;
        touch-action: manipulation;
      }
      button.primary {
        background: var(--rps-signal-default);
        color: var(--rps-text-on-signal);
      }
      button.secondary {
        background: var(--rps-bg-surface);
        color: var(--rps-text-primary);
      }
      @media (hover: hover) {
        button.primary:hover {
          background: var(--rps-signal-pressed);
        }
        button.secondary:hover {
          background: var(--rps-bg-sunken);
        }
      }
      button:active {
        transform: translateY(var(--rps-shadow-offset));
        box-shadow: none;
      }
      button.primary:active {
        background: var(--rps-signal-pressed);
      }
      button.secondary:active {
        background: var(--rps-bg-sunken);
      }
      button[aria-disabled='true'] {
        background: var(--rps-bg-sunken);
        border-color: var(--rps-border-subtle);
        color: var(--rps-text-muted);
        box-shadow: none;
        transform: none;
        cursor: not-allowed;
      }
    `,
  ];

  @property() variant: 'primary' | 'secondary' = 'primary';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() type: 'button' | 'submit' = 'button';

  private handleClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  override render() {
    return html`<button
      part="button"
      class=${this.variant}
      type=${this.type}
      aria-disabled=${this.disabled ? 'true' : nothing}
      @click=${this.handleClick}
    >
      <slot></slot>
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-button': RpsButton;
  }
}
