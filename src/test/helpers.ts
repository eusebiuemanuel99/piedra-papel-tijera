import type { LitElement } from 'lit';
import { gameStore } from '../services/game-store';

export async function mount<T extends LitElement>(
  tag: string,
  props: Record<string, unknown> = {},
): Promise<T> {
  const element = document.createElement(tag) as T;
  Object.assign(element, props);
  document.body.append(element);
  await element.updateComplete;
  return element;
}

export function $<E extends Element = HTMLElement>(host: Element, selector: string): E {
  const found = host.shadowRoot?.querySelector<E>(selector);
  if (!found) throw new Error(`No se encontró "${selector}" en <${host.localName}>`);
  return found;
}

export function $$<E extends Element = HTMLElement>(host: Element, selector: string): E[] {
  return [...(host.shadowRoot?.querySelectorAll<E>(selector) ?? [])];
}

export async function typeInto(field: Element, value: string): Promise<void> {
  const input = $<HTMLInputElement>(field, 'input');
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await (field as LitElement).updateComplete;
}

export async function settle(...elements: Element[]): Promise<void> {
  for (const element of elements) await (element as LitElement).updateComplete;
}

export function resetStore(): void {
  localStorage.clear();
  gameStore.reload();
}
