import React from 'react';
import { applyClassName } from './helpers';
import { useClassName } from './utilities';

export type IndentProps = JSX.IntrinsicElements['div'];

export const Indent = React.forwardRef<HTMLDivElement, IndentProps>(function Indent(props, ref) {
  const className = useClassName({
    width: '2.375em',
  });
  return <div {...applyClassName(props, className)} ref={ref} />;
});
