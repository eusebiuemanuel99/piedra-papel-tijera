import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { THEMES, type ThemePreference } from '../services/theme';
import { baseStyles } from '../styles/shared';
import './rps-icon';

const OPTIONS: Record<ThemePreference, { label: string; icon: 'monitor' | 'sun' | 'moon' }> = {
  system: { label: 'Sistema', icon: 'monitor' },
  light: { label: 'Claro', icon: 'sun' },
  dark: { label: 'Oscuro', icon: 'moon' },
};

@customElement('rps-theme-switch')
export class RpsThemeSwitch extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }
      fieldset {
        margin: 0;
        padding: 0;
        border: 0;
        min-width: 0;
      }
      legend {
        padding: 0;
        margin-bottom: var(--rps-space-2);
        font-size: 14px;
        line-height: 20px;
        color: var(--rps-text-muted);
      }
      .options {
        display: flex;
        gap: var(--rps-space-1);
        padding: var(--rps-space-1);
        border: var(--rps-border-width) solid var(--rps-border-strong);
        border-radius: var(--rps-radius-md);
        background: var(--rps-bg-surface);
      }
      label {
        flex: 1;
        min-width: 0;
        position: relative;
      }
      input {
        position: absolute;
        inset: 0;
        margin: 0;
        opacity: 0;
        cursor: pointer;
      }
      .option {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--rps-space-2);
        min-height: 48px;
        padding: var(--rps-space-3) var(--rps-space-2);
        border-radius: var(--rps-radius-sm);
        color: var(--rps-text-primary);
        font-weight: 700;
        font-size: 16px;
        line-height: 20px;
        pointer-events: none;
      }
      rps-icon {
        --rps-icon-size: 20px;
      }
      input:checked + .option {
        background: var(--rps-signal-default);
        color: var(--rps-text-on-signal);
      }
      input:focus-visible + .option {
        outline: var(--rps-focus-width) solid var(--rps-focus-ring);
        outline-offset: 2px;
      }
    `,
  ];

  @property() value: ThemePreference = 'system';

  focusSelected(): void {
    this.renderRoot.querySelector<HTMLInputElement>('input:checked')?.focus();
  }

  private onChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value as ThemePreference;
    this.value = value;
    this.dispatchEvent(
      new CustomEvent<ThemePreference>('rps-theme-change', {
        detail: value,
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`<fieldset>
      <legend>Apariencia</legend>
      <div class="options">
        ${THEMES.map((theme) => {
          const option = OPTIONS[theme];
          return html`<label>
            <input
              type="radio"
              name="theme"
              .value=${theme}
              .checked=${this.value === theme}
              @change=${this.onChange}
            />
            <span class="option"><rps-icon name=${option.icon}></rps-icon>${option.label}</span>
          </label>`;
        })}
      </div>
    </fieldset>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-theme-switch': RpsThemeSwitch;
  }
}
