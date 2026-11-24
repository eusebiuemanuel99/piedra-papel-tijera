# Piedra, papel o tijera

PWA del clásico piedra, papel o tijera contra la máquina, hecha con Lit, TypeScript y Vite. Funciona sin conexión y guarda la partida de cada jugador en el dispositivo.

## Despliegue

Requisitos: Node.js ≥ 20.19 y npm.

```bash
npm install
npm run build
```

## Desarrollo

| Script                            | Qué hace                                                               |
| --------------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo en http://localhost:5173                        |
| `npm run preview`                 | Sirve la build en local (el service worker solo existe en la build)    |
| `npm test` / `npm run test:watch` | Tests unitarios y de componentes (Vitest + happy-dom)                  |
| `npm run coverage`                | Tests con cobertura                                                    |
| `npm run e2e`                     | E2E de humo sobre la build, incluido modo avión (requiere Chrome/Edge) |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                      |
| `npm run typecheck`               | `tsc --noEmit`                                                         |

## Implementado

- **Home** (`/`): campo de nombre con validación (2–16 caracteres: letras, números, espacios, `-`, `_`, `.`) y botón _Jugar_.
- **Juego** (`/game`): nombre y puntos del jugador, botones de piedra, papel y tijera, y _Salir_. La máquina espera 1 s antes de revelar su jugada. Ganar suma 1 punto; el empate no puntúa.
- **Salir** vuelve a Home. Si se vuelve a escribir un nombre existente (sin distinguir mayúsculas) se continúa su partida.
- **Persistencia** en `localStorage`: jugadores, puntuaciones, historial y sesión abierta. Al reabrir la app en mitad de una partida se vuelve a `/game`.
- **Offline**: service worker (Workbox con `vite-plugin-pwa`) que precachea app, fuentes e iconos. Instalable.
- **Rutas**: cualquier ruta desconocida, o `/game` sin jugador, redirige a Home.

## Extras

- **Ranking** (`/ranking`): mejor puntuación de cada jugador, jugador actual resaltado y puntos que la máquina ha ganado.
- **Máquina**: nunca ve la jugada actual. Con menos de 3 rondas de historial juega al azar; después predice la próxima jugada del jugador combinando transiciones (Markov de orden 1) y frecuencia, y juega lo que la vence. Un 30 % de las veces juega al azar para no ser predecible.
- **Vibración** (200 ms) cuando el jugador pierde, en dispositivos compatibles.
- Tema claro / oscuro / sistema, persistido y sin parpadeo al cargar.
- Aviso de sin conexión no bloqueante.
- Historial de las últimas 5 rondas.
- Accesibilidad: regiones `aria-live`, gestión de foco, foco visible, objetivos táctiles ≥ 48 px y `prefers-reduced-motion`.
