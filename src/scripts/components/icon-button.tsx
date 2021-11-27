import React, { useMemo } from 'react';
import { DISABLED_OPACITY } from './constants';
import { FocusCircle, applyClass } from './helpers';
import { TemplateIcon } from './icon';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type IconButtonProps = {
  iconURL: string;
} & JSX.IntrinsicElements['button'];

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { iconURL, ...props },
  ref,
) {
  const css = useCSS();
  const theme = useTheme();
  const wrapperClass = useMemo(
    () =>
      css({
        position: 'relative',
      }),
    [css],
  );
  const buttonClass = useMemo(
    () =>
      css({
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'block',
        height: '36px',
        padding: '6px',
        width: '36px',
        '&:disabled': {
          cursor: 'default',
          opacity: DISABLED_OPACITY,
        },
        '&:focus': {
          outline: 'none',
        },
      }),
    [css],
  );

  return (
    <div className={wrapperClass}>
      <button {...applyClass(props, buttonClass)} ref={ref}>
        <TemplateIcon color={theme.iconButton} iconSize="24px" url={iconURL} />
      </button>
      <FocusCircle />
    </div>
  );
});
