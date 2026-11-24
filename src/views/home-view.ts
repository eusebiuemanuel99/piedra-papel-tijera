import { LitElement, css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { validateName } from '../domain/player';
import { gameStore } from '../services/game-store';
import { navigate } from '../router';
import { baseStyles, typography, viewStyles } from '../styles/shared';
import '../components/rps-button';
import '../components/rps-icon';
import '../components/rps-icon-button';
import '../components/rps-offline-banner';
import '../components/rps-settings-panel';
import '../components/rps-text-field';
import type { RpsTextField } from '../components/rps-text-field';

@customElement('home-view')
export class HomeView extends LitElement {
  static override styles = [
    baseStyles,
    viewStyles,
    typography,
    css`
      .topbar {
        display: flex;
        justify-content: flex-end;
      }
      .illustration {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        gap: var(--rps-space-3);
        padding: var(--rps-space-6) 0;
      }
      .token {
        display: grid;
        place-items: center;
        width: 92px;
        height: 92px;
        border: var(--rps-border-width) solid var(--rps-border-strong);
        border-radius: var(--rps-radius-md);
        background: var(--rps-bg-surface);
        color: var(--rps-text-primary);
        box-shadow: 0 var(--rps-shadow-offset) 0 var(--rps-border-strong);
      }
      .token.left {
        transform: rotate(-6deg);
      }
      .token.right {
        transform: rotate(6deg) translateY(10px);
      }
      h1 {
        text-align: center;
      }
      h1:focus {
        outline: none;
      }
      .lead {
        text-align: center;
        color: var(--rps-text-muted);
      }
      form {
        display: flex;
        flex-direction: column;
        gap: var(--rps-space-6);
        padding-top: var(--rps-space-2);
      }
    `,
  ];

  @state() private name = '';
  @state() private error = '';
  @state() private settingsOpen = false;

  @query('h1') private heading!: HTMLHeadingElement;
  @query('rps-text-field') private field!: RpsTextField;

  focusHeading(): void {
    this.heading?.focus();
  }

  private onInput(event: CustomEvent<string>): void {
    this.name = event.detail;
    if (this.error) this.error = '';
  }

  private submit(event?: Event): void {
    event?.preventDefault();
    const result = validateName(this.name);
    if (!result.valid) {
      this.error = result.error ?? '';
      this.field?.focus();
      return;
    }
    gameStore.login(result.value);
    navigate('/game');
  }

  private get welcomeBack(): string {
    const validation = validateName(this.name);
    const existing = validation.valid ? gameStore.find(validation.value) : undefined;
    if (!existing) return '';
    const points = existing.score === 1 ? '1 punto' : `${existing.score} puntos`;
    return `Te damos la bienvenida de nuevo. Continúas con ${points}.`;
  }

  override render() {
    return html`
      <div class="topbar">
        <rps-icon-button
          icon="settings"
          label="Ajustes"
          @click=${() => (this.settingsOpen = true)}
        ></rps-icon-button>
      </div>
      <rps-offline-banner></rps-offline-banner>
      <div class="illustration" aria-hidden="true">
        <span class="token left"><rps-icon name="rock" size="56"></rps-icon></span>
        <span class="token"><rps-icon name="paper" size="56"></rps-icon></span>
        <span class="token right"><rps-icon name="scissors" size="56"></rps-icon></span>
      </div>
      <h1 class="heading-l" tabindex="-1">Piedra, papel o tijera</h1>
      <p class="body-l lead">
        Escribe tu nombre para empezar. Si ya jugaste, continuarás donde lo dejaste.
      </p>
      <form novalidate @submit=${this.submit}>
        <rps-text-field
          label="Nombre de jugador"
          placeholder="Ej. Marta"
          helper="Entre 2 y 16 caracteres."
          maxlength="40"
          .value=${this.name}
          .error=${this.error}
          .success=${this.welcomeBack}
          @rps-input=${this.onInput}
          @rps-submit=${this.submit}
        ></rps-text-field>
        <rps-button @click=${() => this.submit()}>Jugar</rps-button>
      </form>
      <div class="spacer"></div>
      <rps-button variant="secondary" @click=${() => navigate('/ranking')}>Ver ranking</rps-button>
      <rps-settings-panel
        .open=${this.settingsOpen}
        @rps-settings-close=${() => (this.settingsOpen = false)}
      ></rps-settings-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'home-view': HomeView;
  }
}
