import '@fontsource/atkinson-hyperlegible-next/400.css';
import '@fontsource/atkinson-hyperlegible-next/700.css';
import '@fontsource-variable/archivo/wght.css';
import './styles/tokens.css';
import './styles/global.css';
import './rps-app';
import { registerSW } from 'virtual:pwa-register';
import { applyTheme, getTheme } from './services/theme';

applyTheme(getTheme());

registerSW({ immediate: true });
