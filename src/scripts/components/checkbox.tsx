import React from 'react';
import { DISABLED_OPACITY, INPUT_Z_INDEX } from './constants';
import { FocusCircle, applyClassName } from './helpers';
import { useClassName } from './utilities';

export type CheckBoxProps = JSX.IntrinsicElements['input'];

export const CheckBox = React.forwardRef<HTMLInputElement, CheckBoxProps>(function CheckBox(
  props,
  ref,
) {
  const wrapperClassName = useClassName({
    height: '16px',
    position: 'relative',
    width: '16px',
  });
  const inputClassName = useClassName({
    cursor: 'pointer',
    height: '100%',
    margin: 0,
    opacity: 0,
    position: 'absolute',
    width: '100%',
    zIndex: INPUT_Z_INDEX,
    '&:disabled': {
      cursor: 'default',
    },
  });
  const imageClassName = useClassName({
    ':disabled + &': {
      opacity: DISABLED_OPACITY,
    },
  });
  const boxClassNmae = useClassName(theme => ({
    border: `solid 2px ${theme.checkBox.border}`,
    borderRadius: '2px',
    height: '16px',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '16px',
    ':checked + * > &': {
      background: theme.checkBox.box,
      border: 'none',
    },
  }));
  const checkMarkClassName = useClassName(theme => ({
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderWidth: '0 0 3px 3px',
    height: '8px',
    left: 0,
    position: 'absolute',
    top: '3px',
    transform: 'rotate(-45deg) scale(0.75)',
    width: '16px',
    ':checked + * > &': {
      borderColor: theme.checkBox.checkMark,
    },
  }));
  return (
    <div className={wrapperClassName}>
      <input {...applyClassName(props, inputClassName)} ref={ref} type="checkbox" />
      <div className={imageClassName}>
        <div className={boxClassNmae} />
        <div className={checkMarkClassName} />
        <FocusCircle depth={1} />
      </div>
    </div>
  );
});
