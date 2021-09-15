import mobile from 'is-mobile';
import { SerpHandler } from '../types';
import { getDesktopSerpHandler } from './google/desktop';
import { getMobileSerpHandler } from './google/mobile';

export function getSerpHandler(): SerpHandler | null {
  const tbm = new URL(window.location.href).searchParams.get('tbm') ?? '';
  return mobile({ tablet: true }) ? getMobileSerpHandler(tbm) : getDesktopSerpHandler(tbm);
}
