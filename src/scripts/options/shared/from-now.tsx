import { useLayoutEffect, useState } from "react";

import { getLocale } from "../../shared/locales.ts";

const MINUTE = 60 * 1000;

const units: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ["year", MINUTE * 60 * 24 * 365],
  ["month", MINUTE * 60 * 24 * 30],
  ["day", MINUTE * 60 * 24],
  ["hour", MINUTE * 60],
  ["minute", MINUTE],
];

function formatFromNow(delta: number, locale: string): string {
  const magnitude = Math.abs(delta);
  const found = units.find(([, unitMs]) => magnitude >= unitMs);
  if (!found) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      0,
      "minute",
    );
  }
  const [unit, unitMs] = found;
  return new Intl.RelativeTimeFormat(locale).format(
    Math.sign(delta) * Math.floor(magnitude / unitMs),
    unit,
  );
}

function modulo(dividend: number, divisor: number): number {
  return ((dividend % divisor) + divisor) % divisor;
}

export type FromNowProps = {
  time: Date;
};

export function FromNow({ time }: FromNowProps) {
  const [text, setText] = useState(() =>
    formatFromNow(time.getTime() - Date.now(), getLocale()),
  );
  useLayoutEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const update = () => {
      const delta = time.getTime() - Date.now();
      setText(formatFromNow(delta, getLocale()));
      timeoutId = setTimeout(update, modulo(delta, MINUTE) || MINUTE);
    };
    update();
    return () => clearTimeout(timeoutId);
  }, [time]);
  return <time dateTime={time.toISOString()}>{text}</time>;
}
