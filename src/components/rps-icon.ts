import { LitElement, css, svg, type SVGTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type IconName =
  | 'rock'
  | 'paper'
  | 'scissors'
  | 'question'
  | 'check'
  | 'cross'
  | 'equal'
  | 'podium'
  | 'back'
  | 'robot'
  | 'wifioff'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'settings';

interface IconDef {
  viewBox: number;
  strokeWidth: number;
  body: SVGTemplateResult;
}

const ICONS: Record<IconName, IconDef> = {
  rock: {
    viewBox: 48,
    strokeWidth: 3,
    body: svg`
      <path d="M9 19a4 4 0 0 1 4-4h22a4 4 0 0 1 4 4v9a12 12 0 0 1-12 12h-6A12 12 0 0 1 9 28z" />
      <path d="M17 15v8M24.5 15v8M32 15v8" />
      <path d="M14 32h8.5a3 3 0 0 0 0-6H14" />`,
  },
  paper: {
    viewBox: 48,
    strokeWidth: 3,
    body: svg`
      <path d="M15 24V11a3 3 0 0 1 6 0v11" />
      <path d="M21 22V8a3 3 0 0 1 6 0v14" />
      <path d="M27 22V10a3 3 0 0 1 6 0v12" />
      <path d="M33 24v-9a3 3 0 0 1 6 0v17" />
      <path d="M15 24c-2-3-6-3-7 0-.5 1.5 0 3 1 4.5l5 8.5c2.5 4 6 6 11 6h2c7 0 12-5 12-12" />`,
  },
  scissors: {
    viewBox: 48,
    strokeWidth: 3,
    body: svg`
      <path d="M17.7 27.1 12.2 10.6A3.5 3.5 0 0 1 18.8 8.4L24.3 24.9" />
      <path d="M30.3 27.1l5.5-16.5a3.5 3.5 0 0 0-6.6-2.2L23.7 24.9" />
      <path d="M17.7 27.1C13 28 10 31 10 35c0 5.5 4.5 9 10 9h8c5.5 0 10-3.5 10-9 0-4-3-7-7.7-7.9" />
      <path d="M16 36h9a2.5 2.5 0 0 0 0-5h-3" />`,
  },
  question: {
    viewBox: 24,
    strokeWidth: 2,
    body: svg`<circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />`,
  },
  check: { viewBox: 24, strokeWidth: 2.5, body: svg`<path d="M20 6 9 17l-5-5" />` },
  cross: { viewBox: 24, strokeWidth: 2.5, body: svg`<path d="M18 6 6 18M6 6l12 12" />` },
  equal: { viewBox: 24, strokeWidth: 2.5, body: svg`<path d="M5 9h14M5 15h14" />` },
  podium: {
    viewBox: 24,
    strokeWidth: 2,
    body: svg`<path d="M3 21h18M4 21v-8h4.5v8M9.75 21V4h4.5v17M15.5 21V9H20v12" />`,
  },
  back: { viewBox: 24, strokeWidth: 2.5, body: svg`<path d="m15 18-6-6 6-6" />` },
  robot: {
    viewBox: 24,
    strokeWidth: 2,
    body: svg`
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <path d="M12 8V4.5M9.5 13.5h.01M14.5 13.5h.01M9.5 17h5" />
      <circle cx="12" cy="3.5" r="1" />`,
  },
  wifioff: {
    viewBox: 24,
    strokeWidth: 2,
    body: svg`<path d="m1 1 22 22M16.7 11.1A11 11 0 0 1 19 12.6M5 12.6a11 11 0 0 1 5.2-2.4M10.7 5.1A16 16 0 0 1 22.6 9M1.4 9a16 16 0 0 1 4.7-2.9M8.5 16.1a6 6 0 0 1 7 0M12 20h.01" />`,
  },
  sun: {
    viewBox: 24,
    strokeWidth: 2,
    body: svg`<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />`,
  },
  moon: {
    viewBox: 24,
    strokeWidth: 2,
    body: svg`<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />`,
  },
  monitor: {
    viewBox: 24,
    strokeWidth: 2,
    body: svg`<rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />`,
  },
  settings: {
    viewBox: 24,
    strokeWidth: 2,
    body: svg`
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />`,
  },
};

@customElement('rps-icon')
export class RpsIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      flex: none;
      width: var(--rps-icon-size, 24px);
      height: var(--rps-icon-size, 24px);
      color: inherit;
    }
    svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `;

  @property({ reflect: true }) name: IconName = 'check';
  @property({ type: Number }) size = 24;

  override willUpdate(): void {
    this.style.setProperty('--rps-icon-size', `${this.size}px`);
  }

  override render() {
    const icon = ICONS[this.name];
    return svg`<svg
      viewBox="0 0 ${icon.viewBox} ${icon.viewBox}"
      stroke-width=${icon.strokeWidth}
      aria-hidden="true"
      focusable="false"
    >${icon.body}</svg>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rps-icon': RpsIcon;
  }
}
