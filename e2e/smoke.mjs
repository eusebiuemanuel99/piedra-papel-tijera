import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const PORT = 4179;
const URL_BASE = `http://localhost:${PORT}`;
const SHOTS = process.env.E2E_SHOTS;

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
if (!executablePath) throw new Error('No se encontró Chrome/Edge. Define CHROME_PATH.');

const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'],
  { stdio: 'ignore' },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const checks = [];
const check = (name, ok) => {
  checks.push({ name, ok });
  console.log(`${ok ? '✔' : '✘'} ${name}`);
};
const shot = async (page, name) => {
  if (!SHOTS) return;
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
};

const clickText = (page, text) =>
  page.evaluate((t) => {
    const walk = (root) => {
      for (const el of root.querySelectorAll('*')) {
        if (el.shadowRoot) {
          const hit = walk(el.shadowRoot);
          if (hit) return hit;
        }
        if (
          ['rps-button', 'rps-move-button', 'button'].includes(el.localName) &&
          el.textContent.trim() === t
        )
          return el;
      }
      return null;
    };
    const target = walk(document);
    target?.click();
    return Boolean(target);
  }, text);

const textOf = (page) =>
  page.evaluate(() => {
    const out = [];
    const walk = (root) => {
      for (const el of root.querySelectorAll('*')) {
        if (el.shadowRoot) walk(el.shadowRoot);
      }
      out.push(root.textContent ?? '');
    };
    walk(document);
    return out.join(' ').replace(/\s+/g, ' ');
  });

const typeName = async (page, value) => {
  await page.evaluate((v) => {
    const find = (root) => {
      for (const el of root.querySelectorAll('*')) {
        if (el.localName === 'input') return el;
        if (el.shadowRoot) {
          const hit = find(el.shadowRoot);
          if (hit) return hit;
        }
      }
      return null;
    };
    const input = find(document);
    input.value = v;
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }, value);
};

let browser;
try {
  for (let i = 0; i < 40; i += 1) {
    try {
      if ((await fetch(URL_BASE)).ok) break;
    } catch {
      await sleep(250);
    }
  }
  browser = await puppeteer.launch({ executablePath, headless: true });
  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(URL_BASE, { waitUntil: 'networkidle0' });

  check('Home es la ruta por defecto', new URL(page.url()).pathname === '/');
  await shot(page, '01-home');

  await page.goto(`${URL_BASE}/ruta/que/no/existe`, { waitUntil: 'networkidle0' });
  check('Una ruta inexistente redirige a Home', new URL(page.url()).pathname === '/');

  await clickText(page, 'Jugar');
  await sleep(200);
  check('Validación: nombre vacío no inicia el juego', new URL(page.url()).pathname === '/');
  check('Validación: se muestra el error', (await textOf(page)).includes('Escribe tu nombre'));
  await shot(page, '02-home-error');

  await typeName(page, 'Marta');
  await clickText(page, 'Jugar');
  await sleep(300);
  check('Con nombre válido se pasa a /game', new URL(page.url()).pathname === '/game');
  await shot(page, '03-game');

  await clickText(page, 'Piedra');
  await sleep(300);
  check('Se muestra "pensando" tras elegir', (await textOf(page)).includes('Pensando'));
  await shot(page, '04-thinking');
  await sleep(1300);
  check('Tras ≥1 s la máquina responde', (await textOf(page)).includes('Siguiente ronda'));
  await shot(page, '05-result');

  await page.reload({ waitUntil: 'networkidle0' });
  check('Al recargar se conserva la partida (/game)', new URL(page.url()).pathname === '/game');
  check('…y el jugador', (await textOf(page)).includes('Marta'));

  await clickText(page, 'Salir');
  await sleep(300);
  check('Salir vuelve a Home', new URL(page.url()).pathname === '/');
  await typeName(page, 'marta');
  await sleep(200);
  check(
    'Mismo nombre: se continúa la partida',
    (await textOf(page)).includes('Te damos la bienvenida de nuevo'),
  );
  await shot(page, '06-home-existing');

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.setOfflineMode(true);
  await page.goto(`${URL_BASE}/`, { waitUntil: 'load' });
  await sleep(500);
  const offlineText = await textOf(page);
  check('Sin conexión la app sigue cargando', offlineText.includes('Piedra, papel o tijera'));
  check('Sin conexión se muestra el aviso', offlineText.includes('Sin conexión'));
  await shot(page, '07-offline');
  await page.setOfflineMode(false);

  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  await page.goto(`${URL_BASE}/ranking`, { waitUntil: 'networkidle0' });
  await shot(page, '08-ranking-dark');
  check('Ranking accesible', (await textOf(page)).includes('Ranking'));
} finally {
  await browser?.close();
  server.kill();
}

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} comprobaciones correctas`);
process.exit(failed.length ? 1 : 0);
