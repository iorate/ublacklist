import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import { apis } from '../apis';
import '../dayjs-locales';

dayjs.extend(dayjsRelativeTime);

export type FromNowProps = {
  time: dayjs.Dayjs;
};

export const FromNow: React.FC<Readonly<FromNowProps>> = props => {
  const [, setState] = React.useState(0);
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setState(state => state + 1);
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return <>{props.time.locale(apis.i18n.getMessage('dayjsLocale')).fromNow()}</>;
};
