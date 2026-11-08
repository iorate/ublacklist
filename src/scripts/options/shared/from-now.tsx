import { useLayoutEffect, useState } from "react";

import { getLocale } from "../../shared/locales.ts";

const units: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

function formatFromNow(time: Date, now: Date, locale: string): string {
  const seconds = (time.getTime() - now.getTime()) / 1000;
  const [unit, unitSeconds] =
    units.find(([, unitSeconds]) => Math.abs(seconds) >= unitSeconds) ??
    units.at(-1)!;
  const value = seconds / unitSeconds;
  return new Intl.RelativeTimeFormat(locale).format(
    Math.sign(value) * Math.round(Math.abs(value)),
    unit,
  );
}

export type FromNowProps = {
  time: Date;
};

export function FromNow({ time }: FromNowProps) {
  const [text, setText] = useState(() =>
    formatFromNow(time, new Date(), getLocale()),
  );
  useLayoutEffect(() => {
    const update = () => {
      setText(formatFromNow(time, new Date(), getLocale()));
    };
    update();
    const intervalId = setInterval(update, 5000);
    return () => clearInterval(intervalId);
  }, [time]);
  return <time dateTime={time.toISOString()}>{text}</time>;
}
