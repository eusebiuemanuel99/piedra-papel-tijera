import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MOVE_LABEL, type Move } from '../domain/moves';
import { baseStyles, focusStyles } from '../styles/shared';
import './rps-icon';

@customElement('rps-move-button')
export class RpsMoveButton extends LitElement {
  static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles = [
    baseStyles,
    focusStyles,
    css`
      :host {
        display: block;
      }
      button {
        appearance: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--rps-space-2);
        width: 100%;
        min-height: 112px;
        padding: var(--rps-space-4) var(--rps-space-2);
        border: var(--rps-border-width) solid var(--rps-border-strong);
        border-radius: var(--rps-radius-md);
        background: var(--rps-bg-surface);
        color: var(--rps-text-primary);
        box-shadow: 0 var(--rps-shadow-offset) 0 var(--rps-border-strong);
        font: 700 16px/20px var(--rps-font-body);
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
      button[aria-pressed='true'] {
        background: var(--rps-signal-default);
        color: var(--rps-text-on-signal);
        transform: translateY(var(--rps-shadow-offset));
        box-shadow: none;
      }
      button[aria-disabled='true']:not([aria-pressed='true']) {
        background: var(--rps-bg-sunken);
        border-color: var(--rps-border-subtle);
        color: var(--rps-text-muted);
        box-shadow: none;
        transform: none;
        cursor: not-allowed;
      }
      button[aria-disabled='true'] {
        cursor: not-allowed;
      }
    `,
  ];

  @property() move: Move = 'rock';
  @property({ type: Boolean }) selected = false;
  @property({ type: Boolean }) disabled = false;

  private handleClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  override render() {
    return html`<button
      type="button"
      aria-pressed=${this.selected ? 'true' : 'false'}
      aria-disabled=${this.disabled ? 'true' : nothing}
      @click=${this.handleClick}
    >
      <rps-icon name=${this.move} size="48"></rps-icon>
      <span>${MOVE_LABEL[this.move]}</span>
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-move-button': RpsMoveButton;
  }
}
