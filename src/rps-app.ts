import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { gameStore } from './services/game-store';
import { NAVIGATE_EVENT, currentPath, navigate, resolveRoute, type RouteName } from './router';
import './views/home-view';
import './views/game-view';
import './views/ranking-view';

const TITLES: Record<RouteName, string> = {
  home: 'Piedra, papel o tijera',
  game: 'Partida · Piedra, papel o tijera',
  ranking: 'Ranking · Piedra, papel o tijera',
};

interface FocusableView extends HTMLElement {
  focusHeading(): void;
}

@customElement('rps-app')
export class RpsApp extends LitElement {
  @state() private route: RouteName = 'home';

  private unsubscribe?: () => void;
  private previousRoute?: RouteName;

  private readonly sync = (): void => {
    const match = resolveRoute(currentPath(), gameStore.currentPlayer !== undefined);
    if (match.redirect !== undefined) {
      // replaceState lanza de nuevo el evento, que vuelve a resolver la ruta ya corregida.
      navigate(match.redirect, { replace: true });
      return;
    }
    this.route = match.route;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('popstate', this.sync);
    window.addEventListener(NAVIGATE_EVENT, this.sync);
    this.unsubscribe = gameStore.subscribe(this.sync);
    this.sync();
  }

  override disconnectedCallback(): void {
    window.removeEventListener('popstate', this.sync);
    window.removeEventListener(NAVIGATE_EVENT, this.sync);
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  protected override updated(): void {
    if (this.previousRoute === this.route) return;
    document.title = TITLES[this.route];
    if (this.previousRoute !== undefined) {
      const view = this.renderRoot.querySelector<FocusableView>(
        'home-view, game-view, ranking-view',
      );
      view?.focusHeading();
    }
    this.previousRoute = this.route;
  }

  override render() {
    switch (this.route) {
      case 'game':
        return html`<game-view></game-view>`;
      case 'ranking':
        return html`<ranking-view></ranking-view>`;
      case 'home':
        return html`<home-view></home-view>`;
      default:
        return nothing;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-app': RpsApp;
  }
}
