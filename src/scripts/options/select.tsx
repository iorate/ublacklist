import { FunctionComponent, h } from 'preact';
import * as select from '../components/select';
import { useOptionsContext } from './options-context';

export type { SelectProps, SelectOptionProps } from '../components/select';
export { SelectOption } from '../components/select';

export const Select: FunctionComponent<select.SelectProps> = props => {
  const {
    platformInfo: { os },
  } = useOptionsContext();
  // https://github.com/preactjs/preact/pull/3214
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <select.Select {...props} native={os !== 'win'} />;
};
