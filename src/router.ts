export type RouteName = 'home' | 'game' | 'ranking';

export interface RouteMatch {
  route: RouteName;
  redirect?: string;
}

export const NAVIGATE_EVENT = 'rps-navigate';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function stripBase(pathname: string, base: string = BASE): string {
  let path = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  path = path.replace(/\/+$/, '');
  return path === '' ? '/' : path;
}

export function withBase(path: string, base: string = BASE): string {
  return `${base}${path}` || '/';
}

export function resolveRoute(path: string, hasPlayer: boolean): RouteMatch {
  switch (path) {
    case '/':
      return hasPlayer ? { route: 'game', redirect: '/game' } : { route: 'home' };
    case '/game':
      return hasPlayer ? { route: 'game' } : { route: 'home', redirect: '/' };
    case '/ranking':
      return { route: 'ranking' };
    default:
      return hasPlayer ? { route: 'game', redirect: '/game' } : { route: 'home', redirect: '/' };
  }
}

export function currentPath(): string {
  return stripBase(window.location.pathname);
}

export function navigate(path: string, { replace = false } = {}): void {
  const url = withBase(path);
  if (replace) window.history.replaceState(null, '', url);
  else if (window.location.pathname !== url) window.history.pushState(null, '', url);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}
