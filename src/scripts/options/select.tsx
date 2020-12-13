import { FunctionComponent, h } from 'preact';
import { useContext } from 'preact/hooks';
import { SelectProps, Select as _Select } from '../components/select';
import { Context } from './context';

export const Select: FunctionComponent<SelectProps> = props => {
  const {
    platformInfo: { os },
  } = useContext(Context);
  return <_Select {...props} native={os !== 'win'} />;
};

export { SelectProps, SelectOption, SelectOptionProps } from '../components/select';
