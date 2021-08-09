import { FunctionComponent, h } from 'preact';
import { SelectProps, Select as _Select } from '../components/select';
import { useOptionsContext } from './options-context';

export { SelectProps, SelectOption, SelectOptionProps } from '../components/select';

export const Select: FunctionComponent<SelectProps> = props => {
  const {
    platformInfo: { os },
  } = useOptionsContext();
  // https://github.com/preactjs/preact/pull/3214
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <_Select {...props} native={os !== 'win'} />;
};
