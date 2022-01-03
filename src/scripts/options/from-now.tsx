import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useState } from 'react';
import '../dayjs-locales';
import { translate } from '../locales';

dayjs.extend(dayjsRelativeTime);

export type FromNowProps = {
  time: dayjs.Dayjs;
};

export const FromNow: React.VFC<FromNowProps> = ({ time }) => {
  const [, setState] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setState(state => state + 1);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);
  return <time dateTime={time.toISOString()}>{time.locale(translate('lang')).fromNow()}</time>;
};
