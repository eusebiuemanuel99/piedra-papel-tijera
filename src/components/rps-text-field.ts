import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { baseStyles, focusStyles } from '../styles/shared';
import './rps-icon';

@customElement('rps-text-field')
export class RpsTextField extends LitElement {
  static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles = [
    baseStyles,
    focusStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--rps-space-2);
      }
      label {
        font-weight: 700;
        font-size: 16px;
        line-height: 20px;
        color: var(--rps-text-primary);
      }
      input {
        appearance: none;
        width: 100%;
        min-height: 56px;
        padding: var(--rps-space-3) var(--rps-space-4);
        border: var(--rps-border-width) solid var(--rps-border-strong);
        border-radius: var(--rps-radius-md);
        background: var(--rps-bg-surface);
        color: var(--rps-text-primary);
        font: 400 18px/26px var(--rps-font-body);
      }
      input::placeholder {
        color: var(--rps-text-muted);
        opacity: 1;
      }
      input[aria-invalid='true'] {
        border-color: var(--rps-result-lose);
      }
      input.success {
        border-color: var(--rps-result-win);
      }
      input:disabled {
        background: var(--rps-bg-sunken);
        border-color: var(--rps-border-subtle);
      }
      .helper {
        display: flex;
        gap: var(--rps-space-2);
        align-items: flex-start;
        font-size: 14px;
        line-height: 20px;
        color: var(--rps-text-muted);
        min-height: 20px;
      }
      .helper rps-icon {
        --rps-icon-size: 20px;
      }
      .helper.error {
        color: var(--rps-result-lose);
      }
      .helper.success {
        color: var(--rps-result-win);
      }
    `,
  ];

  @property() label = '';
  @property() value = '';
  @property() placeholder = '';
  @property() name = 'name';
  @property() helper = '';
  @property() error = '';
  @property() success = '';
  @property({ type: Number }) maxlength = 40;
  @property({ type: Boolean }) disabled = false;

  @query('input') private input!: HTMLInputElement;

  private readonly uid = `rps-field-${Math.random().toString(36).slice(2, 8)}`;

  private onInput(): void {
    this.value = this.input.value;
    this.dispatchEvent(
      new CustomEvent<string>('rps-input', { detail: this.value, bubbles: true, composed: true }),
    );
  }

  private onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.dispatchEvent(new CustomEvent('rps-submit', { bubbles: true, composed: true }));
    }
  }

  override render() {
    const hasError = this.error !== '';
    const hasSuccess = !hasError && this.success !== '';
    const helperId = `${this.uid}-helper`;
    const message = hasError ? this.error : hasSuccess ? this.success : this.helper;

    return html`
      <label for=${this.uid}>${this.label}</label>
      <input
        id=${this.uid}
        class=${hasSuccess ? 'success' : ''}
        name=${this.name}
        type="text"
        .value=${this.value}
        placeholder=${this.placeholder}
        maxlength=${this.maxlength}
        ?disabled=${this.disabled}
        autocomplete="off"
        autocapitalize="words"
        spellcheck="false"
        enterkeyhint="go"
        aria-invalid=${hasError ? 'true' : nothing}
        aria-describedby=${helperId}
        @input=${this.onInput}
        @keydown=${this.onKeydown}
      />
      <div
        id=${helperId}
        class="helper ${hasError ? 'error' : hasSuccess ? 'success' : ''}"
        role=${hasError ? 'alert' : nothing}
      >
        ${hasError ? html`<rps-icon name="cross"></rps-icon>` : nothing}
        ${hasSuccess ? html`<rps-icon name="check"></rps-icon>` : nothing}
        <span>${message}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-text-field': RpsTextField;
  }
}
