import mobile from 'is-mobile';
import { SerpHandler } from '../types';
import { getDesktopSerpHandler } from './bing/desktop';
import { getMobileSerpHandler } from './bing/mobile';

export function getSerpHandler(): SerpHandler | null {
  const path = new URL(window.location.href).pathname;
  return mobile({ tablet: true }) ? getMobileSerpHandler(path) : getDesktopSerpHandler(path);
}
