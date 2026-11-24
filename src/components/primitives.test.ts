import { describe, expect, it, vi } from 'vitest';
import { $, $$, mount, typeInto } from '../test/helpers';
import './rps-button';
import './rps-icon';
import './rps-icon-button';
import './rps-move-button';
import './rps-text-field';
import type { RpsButton } from './rps-button';
import type { RpsIcon } from './rps-icon';
import type { RpsIconButton } from './rps-icon-button';
import type { RpsMoveButton } from './rps-move-button';
import type { RpsTextField } from './rps-text-field';

describe('rps-icon', () => {
  it('pinta un svg decorativo con el tamaño indicado', async () => {
    const icon = await mount<RpsIcon>('rps-icon', { name: 'rock', size: 48 });
    const svg = $(icon, 'svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('viewBox')).toBe('0 0 48 48');
    expect(icon.style.getPropertyValue('--rps-icon-size')).toBe('48px');
  });

  it('cada icono usa su cuadrícula', async () => {
    const icon = await mount<RpsIcon>('rps-icon', { name: 'check' });
    expect($(icon, 'svg').getAttribute('viewBox')).toBe('0 0 24 24');
  });
});

describe('rps-button', () => {
  it('proyecta su etiqueta y usa la variante primaria por defecto', async () => {
    const button = await mount<RpsButton>('rps-button');
    button.textContent = 'Jugar';
    expect($(button, 'button').classList.contains('primary')).toBe(true);
    expect($(button, 'slot')).toBeTruthy();
  });

  it('variante secundaria', async () => {
    const button = await mount<RpsButton>('rps-button', { variant: 'secondary' });
    expect($(button, 'button').classList.contains('secondary')).toBe(true);
  });

  it('emite click cuando está habilitado', async () => {
    const button = await mount<RpsButton>('rps-button');
    const onClick = vi.fn();
    button.addEventListener('click', onClick);
    $(button, 'button').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('deshabilitado: aria-disabled, sigue enfocable y no propaga el click', async () => {
    const button = await mount<RpsButton>('rps-button', { disabled: true });
    const inner = $<HTMLButtonElement>(button, 'button');
    expect(inner.getAttribute('aria-disabled')).toBe('true');
    expect(inner.disabled).toBe(false);
    const onClick = vi.fn();
    button.addEventListener('click', onClick);
    inner.click();
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('rps-icon-button', () => {
  it('expone aria-label y title a partir de label', async () => {
    const button = await mount<RpsIconButton>('rps-icon-button', {
      icon: 'settings',
      label: 'Ajustes',
    });
    const inner = $(button, 'button');
    expect(inner.getAttribute('aria-label')).toBe('Ajustes');
    expect(inner.getAttribute('title')).toBe('Ajustes');
    expect($(button, 'rps-icon').getAttribute('name')).toBe('settings');
  });
});

describe('rps-move-button', () => {
  it.each([
    ['rock', 'Piedra'],
    ['paper', 'Papel'],
    ['scissors', 'Tijera'],
  ] as const)('muestra icono y texto de %s', async (move, label) => {
    const button = await mount<RpsMoveButton>('rps-move-button', { move });
    expect($(button, 'span').textContent).toBe(label);
    expect($(button, 'rps-icon').getAttribute('name')).toBe(move);
  });

  it('refleja la selección con aria-pressed', async () => {
    const button = await mount<RpsMoveButton>('rps-move-button', { move: 'paper' });
    expect($(button, 'button').getAttribute('aria-pressed')).toBe('false');
    button.selected = true;
    await button.updateComplete;
    expect($(button, 'button').getAttribute('aria-pressed')).toBe('true');
  });

  it('deshabilitado no emite click', async () => {
    const button = await mount<RpsMoveButton>('rps-move-button', { disabled: true });
    const onClick = vi.fn();
    button.addEventListener('click', onClick);
    $(button, 'button').click();
    expect(onClick).not.toHaveBeenCalled();
    expect($(button, 'button').getAttribute('aria-disabled')).toBe('true');
  });
});

describe('rps-text-field', () => {
  it('asocia la etiqueta con el input y el texto de ayuda', async () => {
    const field = await mount<RpsTextField>('rps-text-field', {
      label: 'Nombre de jugador',
      helper: 'Entre 2 y 16 caracteres.',
    });
    const label = $<HTMLLabelElement>(field, 'label');
    const input = $<HTMLInputElement>(field, 'input');
    expect(label.htmlFor).toBe(input.id);
    expect(label.textContent).toBe('Nombre de jugador');
    const helper = $(field, '.helper');
    expect(input.getAttribute('aria-describedby')).toBe(helper.id);
    expect(helper.textContent?.trim()).toBe('Entre 2 y 16 caracteres.');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('emite rps-input con el valor escrito', async () => {
    const field = await mount<RpsTextField>('rps-text-field');
    const onInput = vi.fn();
    field.addEventListener('rps-input', (e) => onInput((e as CustomEvent<string>).detail));
    await typeInto(field, 'Marta');
    expect(onInput).toHaveBeenCalledWith('Marta');
    expect(field.value).toBe('Marta');
  });

  it('emite rps-submit con Enter', async () => {
    const field = await mount<RpsTextField>('rps-text-field');
    const onSubmit = vi.fn();
    field.addEventListener('rps-submit', onSubmit);
    $(field, 'input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('error: aria-invalid, role="alert", icono y texto', async () => {
    const field = await mount<RpsTextField>('rps-text-field', {
      error: 'Escribe al menos 2 caracteres.',
    });
    expect($(field, 'input').getAttribute('aria-invalid')).toBe('true');
    const helper = $(field, '.helper');
    expect(helper.getAttribute('role')).toBe('alert');
    expect(helper.textContent).toContain('Escribe al menos 2 caracteres.');
    expect($$(field, '.helper rps-icon')).toHaveLength(1);
  });

  it('éxito: borde verde, icono y texto; el error tiene prioridad', async () => {
    const field = await mount<RpsTextField>('rps-text-field', { success: 'Bienvenida de nuevo.' });
    expect($(field, 'input').classList.contains('success')).toBe(true);
    expect($(field, '.helper').textContent).toContain('Bienvenida de nuevo.');

    field.error = 'Fallo';
    await field.updateComplete;
    expect($(field, 'input').classList.contains('success')).toBe(false);
    expect($(field, '.helper').textContent).toContain('Fallo');
  });
});
