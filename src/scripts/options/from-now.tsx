import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
import { Fragment, FunctionComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { apis } from '../apis';
import '../dayjs-locales';

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
  return <Fragment>{props.time.locale(apis.i18n.getMessage('dayjsLocale')).fromNow()}</Fragment>;
};
