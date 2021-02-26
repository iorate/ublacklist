import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
import { FunctionComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import '../dayjs-locales';
import { translate } from '../utilities';

dayjs.extend(dayjsRelativeTime);

export type FromNowProps = {
  time: dayjs.Dayjs;
};

export const FromNow: FunctionComponent<Readonly<FromNowProps>> = ({ time }) => {
  const [, setState] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setState(state => state + 1);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);
  return <time dateTime={time.toISOString()}>{time.locale(translate('lang')).fromNow()}</time>;
};
