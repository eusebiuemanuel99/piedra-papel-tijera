import { css } from 'lit';

export const baseStyles = css`
  :host {
    box-sizing: border-box;
    font-family: var(--rps-font-body);
  }
  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }
  [hidden] {
    display: none !important;
  }
`;

export const focusStyles = css`
  :focus-visible {
    outline: var(--rps-focus-width) solid var(--rps-focus-ring);
    outline-offset: var(--rps-focus-offset);
  }
`;

export const viewStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    gap: var(--rps-space-4);
    width: 100%;
    max-width: 430px;
    min-height: 100dvh;
    margin: 0 auto;
    padding: max(var(--rps-space-6), env(safe-area-inset-top)) var(--rps-space-6)
      max(var(--rps-space-8), env(safe-area-inset-bottom));
  }
  .spacer {
    flex: 1;
  }
`;

export const typography = css`
  .heading-l {
    font-family: var(--rps-font-display);
    font-weight: 800;
    font-size: 32px;
    line-height: 38px;
    margin: 0;
  }
  .heading-m {
    font-family: var(--rps-font-display);
    font-weight: 700;
    font-size: 24px;
    line-height: 30px;
    margin: 0;
  }
  .body-l {
    font-size: 18px;
    line-height: 26px;
    margin: 0;
  }
  .caption {
    font-size: 14px;
    line-height: 20px;
  }
  .label {
    font-weight: 700;
    font-size: 16px;
    line-height: 20px;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
`;
