import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { baseStyles } from '../styles/shared';
import './rps-icon';

@customElement('rps-offline-banner')
export class RpsOfflineBanner extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }
      .banner {
        display: flex;
        align-items: center;
        gap: var(--rps-space-3);
        padding: var(--rps-space-3) var(--rps-space-4);
        border: var(--rps-border-width) solid var(--rps-result-draw);
        border-radius: var(--rps-radius-md);
        background: var(--rps-result-draw-bg);
        color: var(--rps-text-primary);
      }
      rps-icon {
        --rps-icon-size: 28px;
        color: var(--rps-result-draw);
      }
      p {
        margin: 0;
        font-size: 16px;
        line-height: 24px;
      }
    `,
  ];

  @state() private online = navigator.onLine;

  private readonly sync = (): void => {
    this.online = navigator.onLine;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.sync();
    window.addEventListener('online', this.sync);
    window.addEventListener('offline', this.sync);
  }

  override disconnectedCallback(): void {
    window.removeEventListener('online', this.sync);
    window.removeEventListener('offline', this.sync);
    super.disconnectedCallback();
  }

  override render() {
    return html`<div role="status">
      ${
        this.online
          ? null
          : html`<div class="banner">
              <rps-icon name="wifioff"></rps-icon>
              <p>Sin conexión. Puedes seguir jugando: tu partida se guarda en este dispositivo.</p>
            </div>`
      }
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-offline-banner': RpsOfflineBanner;
  }
}
