import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
import { Fragment, FunctionComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import '../dayjs-locales';
import { translate } from '../utilities';

dayjs.extend(dayjsRelativeTime);

export type FromNowProps = {
  time: dayjs.Dayjs;
};

export const FromNow: FunctionComponent<Readonly<FromNowProps>> = props => {
  const [, setState] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setState(state => state + 1);
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return <>{props.time.locale(translate('dayjsLocale')).fromNow()}</>;
};
