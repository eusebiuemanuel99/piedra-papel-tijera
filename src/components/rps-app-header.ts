import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { baseStyles } from '../styles/shared';
import './rps-button';

@customElement('rps-app-header')
export class RpsAppHeader extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--rps-space-4);
      }
      h1 {
        margin: 0;
        font-family: var(--rps-font-display);
        font-weight: 700;
        font-size: 24px;
        line-height: 30px;
        color: var(--rps-text-primary);
      }
      h1:focus {
        outline: none;
      }
    `,
  ];

  @property() heading = '';
  @property({ attribute: 'back-label' }) backLabel = 'Volver';

  @query('h1') private titleElement!: HTMLHeadingElement;

  focusTitle(): void {
    this.titleElement?.focus();
  }

  private onBack(): void {
    this.dispatchEvent(new CustomEvent('rps-back', { bubbles: true, composed: true }));
  }

  override render() {
    return html`<header>
      <rps-button variant="secondary" @click=${this.onBack}>${this.backLabel}</rps-button>
      <h1 tabindex="-1">${this.heading}</h1>
    </header>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-app-header': RpsAppHeader;
  }
}
