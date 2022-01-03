import React from 'react';
import * as _Select from '../components/select';
import { useOptionsContext } from './options-context';

export type { SelectOptionProps } from '../components/select';
export { SelectOption } from '../components/select';

export type SelectProps = { ref?: React.Ref<HTMLSelectElement> } & _Select.SelectProps;

export const Select: React.VFC<SelectProps> = props => {
  const {
    platformInfo: { os },
  } = useOptionsContext();
  return <_Select.Select {...props} native={os !== 'win'} />;
};
