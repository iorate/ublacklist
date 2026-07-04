import dayjs from "dayjs";
import dayjsRelativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";
import "../shared/dayjs-locales.ts";
import { translate } from "../shared/locales.ts";

dayjs.extend(dayjsRelativeTime);

export type FromNowProps = {
  time: dayjs.Dayjs;
};

export function FromNow({ time }: FromNowProps) {
  const [, setState] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setState((state) => state + 1);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <time dateTime={time.toISOString()}>
      {time.locale(translate("lang")).fromNow()}
    </time>
  );
}
