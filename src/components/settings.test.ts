import { describe, expect, it, vi } from 'vitest';
import { $, $$, mount } from '../test/helpers';
import './rps-settings-panel';
import './rps-theme-switch';
import type { RpsSettingsPanel } from './rps-settings-panel';
import type { RpsThemeSwitch } from './rps-theme-switch';

describe('rps-theme-switch', () => {
  it('es un fieldset con legend y tres radios', async () => {
    const sw = await mount<RpsThemeSwitch>('rps-theme-switch');
    expect($(sw, 'legend').textContent).toBe('Apariencia');
    const radios = $$<HTMLInputElement>(sw, 'input[type="radio"]');
    expect(radios.map((r) => r.value)).toEqual(['system', 'light', 'dark']);
    expect(radios.find((r) => r.checked)?.value).toBe('system');
  });

  it('emite rps-theme-change al elegir una opción', async () => {
    const sw = await mount<RpsThemeSwitch>('rps-theme-switch');
    const onChange = vi.fn();
    sw.addEventListener('rps-theme-change', (e) => onChange((e as CustomEvent).detail));
    const dark = $$<HTMLInputElement>(sw, 'input').find((r) => r.value === 'dark')!;
    dark.checked = true;
    dark.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('dark');
    expect(sw.value).toBe('dark');
  });
});

describe('rps-settings-panel', () => {
  it('se abre y se cierra con la propiedad open', async () => {
    const panel = await mount<RpsSettingsPanel>('rps-settings-panel');
    const dialog = $<HTMLDialogElement>(panel, 'dialog');
    expect(dialog.hasAttribute('open')).toBe(false);

    panel.open = true;
    await panel.updateComplete;
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBe('settings-title');

    panel.open = false;
    await panel.updateComplete;
    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('el botón ✕ cierra y emite rps-settings-close', async () => {
    const panel = await mount<RpsSettingsPanel>('rps-settings-panel', { open: true });
    const onClose = vi.fn();
    panel.addEventListener('rps-settings-close', onClose);
    $(panel, 'rps-icon-button').click();
    await panel.updateComplete;
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(panel.open).toBe(false);
  });

  it('Escape (evento cancel) cierra el panel', async () => {
    const panel = await mount<RpsSettingsPanel>('rps-settings-panel', { open: true });
    $(panel, 'dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    await panel.updateComplete;
    expect(panel.open).toBe(false);
  });

  it('pulsar el fondo (el propio dialog) cierra; pulsar el contenido no', async () => {
    const panel = await mount<RpsSettingsPanel>('rps-settings-panel', { open: true });
    $(panel, 'h2').click();
    await panel.updateComplete;
    expect(panel.open).toBe(true);
    $(panel, 'dialog').click();
    await panel.updateComplete;
    expect(panel.open).toBe(false);
  });

  it('cambiar la apariencia la aplica a <html> y la persiste', async () => {
    const panel = await mount<RpsSettingsPanel>('rps-settings-panel', { open: true });
    const sw = $<RpsThemeSwitch>(panel, 'rps-theme-switch');
    await sw.updateComplete;
    const dark = $$<HTMLInputElement>(sw, 'input').find((r) => r.value === 'dark')!;
    dark.checked = true;
    dark.dispatchEvent(new Event('change', { bubbles: true }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('rps:theme')).toBe('dark');
  });
});
