export function clampSyncInterval(minutes: number): number {
  return Math.max(5, minutes);
}

export function clampUpdateInterval(minutes: number): number {
  return Math.max(1440, minutes);
}
