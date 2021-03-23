import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { DISABLED_OPACITY } from './constants';
import { FocusCircle, applyClass } from './helpers';
import { TemplateIcon } from './icon';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type IconButtonProps = {
  'aria-expanded'?: boolean;
  'aria-haspopup'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  iconURL: string;
} & JSX.IntrinsicElements['button'];

export const IconButton = forwardRef(
  ({ iconURL, ...props }: IconButtonProps, ref: Ref<HTMLButtonElement>) => {
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
      <div class={wrapperClass}>
        <button {...applyClass(props, buttonClass)} ref={ref}>
          <TemplateIcon color={theme.iconButton} iconSize="24px" url={iconURL} />
        </button>
        <FocusCircle />
      </div>
    );
  },
);
