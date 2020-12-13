import { FunctionComponent, h } from 'preact';
import { SelectProps, Select as _Select } from '../components/select';
import { useOptionsContext } from './options-context';

export const Select: FunctionComponent<SelectProps> = props => {
  const {
    platformInfo: { os },
  } = useOptionsContext();
  return <_Select {...props} native={os !== 'win'} />;
};

export { SelectProps, SelectOption, SelectOptionProps } from '../components/select';
