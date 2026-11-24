import { beforeEach, describe, expect, it } from 'vitest';
import { gameStore } from '../services/game-store';
import { currentPath } from '../router';
import { $, mount, resetStore, settle, typeInto } from '../test/helpers';
import './home-view';
import type { HomeView } from './home-view';
import type { RpsSettingsPanel } from '../components/rps-settings-panel';
import type { RpsTextField } from '../components/rps-text-field';

async function setup() {
  const view = await mount<HomeView>('home-view');
  const field = $<RpsTextField>(view, 'rps-text-field');
  return { view, field };
}

async function submit(view: HomeView) {
  $(view, 'form rps-button').click();
  await settle(view, $(view, 'rps-text-field'));
}

describe('home-view', () => {
  beforeEach(() => resetStore());

  it('muestra título, campo de nombre y acciones', async () => {
    const { view, field } = await setup();
    expect($(view, 'h1').textContent).toBe('Piedra, papel o tijera');
    expect(field.label).toBe('Nombre de jugador');
    expect($(view, 'form rps-button').textContent).toBe('Jugar');
    expect($(view, '.spacer + rps-button').textContent).toBe('Ver ranking');
  });

  it('no inicia el juego con el nombre vacío y muestra el error', async () => {
    const { view, field } = await setup();
    await submit(view);
    expect(field.error).toMatch(/Escribe tu nombre/);
    expect(currentPath()).toBe('/');
    expect(gameStore.currentPlayer).toBeUndefined();
  });

  it('valida la longitud mínima', async () => {
    const { view, field } = await setup();
    await typeInto(field, 'M');
    await submit(view);
    expect(field.error).toBe('Escribe al menos 2 caracteres.');
    expect(gameStore.currentPlayer).toBeUndefined();
  });

  it('rechaza caracteres no permitidos', async () => {
    const { view, field } = await setup();
    await typeInto(field, '<script>');
    await submit(view);
    expect(field.error).toMatch(/solo letras/);
  });

  it('limpia el error al volver a escribir', async () => {
    const { view, field } = await setup();
    await submit(view);
    expect(field.error).not.toBe('');
    await typeInto(field, 'Ma');
    await settle(view, field);
    expect(field.error).toBe('');
  });

  it('con un nombre válido crea el jugador y navega a /game', async () => {
    const { view, field } = await setup();
    await typeInto(field, '  Marta ');
    await submit(view);
    expect(gameStore.currentPlayer?.name).toBe('Marta');
    expect(currentPath()).toBe('/game');
  });

  it('Enter en el campo también inicia el juego', async () => {
    const { field } = await setup();
    await typeInto(field, 'Lucas');
    $(field, 'input').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }),
    );
    expect(gameStore.currentPlayer?.name).toBe('Lucas');
    expect(currentPath()).toBe('/game');
  });

  it('avisa de que se continuará la partida si el jugador ya existe', async () => {
    gameStore.login('Marta');
    gameStore.recordRound('rock', 'win');
    gameStore.recordRound('rock', 'win');
    gameStore.logout();

    const { view, field } = await setup();
    await typeInto(field, 'marta');
    await settle(view, field);
    expect(field.success).toBe('Te damos la bienvenida de nuevo. Continúas con 2 puntos.');

    await submit(view);
    expect(gameStore.currentPlayer?.score).toBe(2);
  });

  it('"Ver ranking" navega a /ranking', async () => {
    const { view } = await setup();
    $(view, '.spacer + rps-button').click();
    expect(currentPath()).toBe('/ranking');
  });

  it('el botón de ajustes abre el panel y devuelve el estado al cerrarlo', async () => {
    const { view } = await setup();
    const panel = $<RpsSettingsPanel>(view, 'rps-settings-panel');
    expect($(view, 'rps-icon-button').getAttribute('label')).toBe('Ajustes');
    $(view, 'rps-icon-button').click();
    await settle(view, panel);
    expect(panel.open).toBe(true);
    $(panel, 'rps-icon-button').click();
    await settle(view, panel);
    expect(panel.open).toBe(false);
  });
});
