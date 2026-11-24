import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { getTheme, setTheme, type ThemePreference } from '../services/theme';
import { baseStyles } from '../styles/shared';
import './rps-icon-button';
import './rps-theme-switch';
import type { RpsThemeSwitch } from './rps-theme-switch';

@customElement('rps-settings-panel')
export class RpsSettingsPanel extends LitElement {
  static override styles = [
    baseStyles,
    css`
      dialog {
        width: 100%;
        max-width: 430px;
        margin: auto auto 0;
        padding: var(--rps-space-6) var(--rps-space-6) var(--rps-space-8);
        border: var(--rps-border-width) solid var(--rps-border-strong);
        border-bottom: 0;
        border-radius: var(--rps-radius-lg) var(--rps-radius-lg) 0 0;
        background: var(--rps-bg-surface);
        color: var(--rps-text-primary);
        overflow: visible;
      }
      dialog::backdrop {
        background: var(--rps-scrim);
      }
      dialog[open] {
        display: flex;
        flex-direction: column;
        gap: var(--rps-space-6);
        animation: slide 200ms ease-out;
      }
      @keyframes slide {
        from {
          transform: translateY(24px);
          opacity: 0;
        }
      }
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      h2 {
        margin: 0;
        font-family: var(--rps-font-display);
        font-weight: 700;
        font-size: 24px;
        line-height: 30px;
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) open = false;
  @property() theme: ThemePreference = getTheme();

  @query('dialog') private dialog!: HTMLDialogElement;
  @query('rps-theme-switch') private switcher!: RpsThemeSwitch;

  override updated(changed: Map<string, unknown>): void {
    if (!changed.has('open')) return;
    if (this.open && !this.dialog.open) {
      this.theme = getTheme();
      if (typeof this.dialog.showModal === 'function') this.dialog.showModal();
      else this.dialog.setAttribute('open', '');
      this.updateComplete.then(() => this.switcher?.focusSelected());
    } else if (!this.open && this.dialog.open) {
      if (typeof this.dialog.close === 'function') this.dialog.close();
      else this.dialog.removeAttribute('open');
    }
  }

  private requestClose = (): void => {
    this.open = false;
    this.dispatchEvent(new CustomEvent('rps-settings-close', { bubbles: true, composed: true }));
  };

  /** Escape dispara `cancel`: lo gestionamos para mantener `open` sincronizado. */
  private onCancel(event: Event): void {
    event.preventDefault();
    this.requestClose();
  }

  private onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog) this.requestClose();
  }

  private onThemeChange(event: CustomEvent<ThemePreference>): void {
    this.theme = event.detail;
    setTheme(event.detail);
  }

  override render() {
    return html`<dialog
      aria-labelledby="settings-title"
      @cancel=${this.onCancel}
      @click=${this.onDialogClick}
    >
      <div class="head">
        <h2 id="settings-title">Ajustes</h2>
        <rps-icon-button
          icon="cross"
          label="Cerrar ajustes"
          @click=${this.requestClose}
        ></rps-icon-button>
      </div>
      <rps-theme-switch
        .value=${this.theme}
        @rps-theme-change=${this.onThemeChange}
      ></rps-theme-switch>
    </dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-settings-panel': RpsSettingsPanel;
  }
}
