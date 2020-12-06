import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useLayoutEffect, useMemo } from 'preact/hooks';
import { applyClass, useInnerRef } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type TextAreaProps = { breakAll?: boolean } & JSX.IntrinsicElements['textarea'];

export const TextArea = forwardRef(
  ({ breakAll, ...props }: TextAreaProps, ref: Ref<HTMLTextAreaElement>) => {
    const css = useCSS();
    const theme = useTheme();
    const class_ = useMemo(
      () =>
        css({
          background: 'transparent',
          border: `solid 1px ${theme.textArea.border}`,
          borderRadius: '4px',
          color: theme.text.primary,
          display: 'block',
          fontFamily: 'inherit',
          fontSize: '1em',
          lineHeight: '1.5',
          padding: '0.5em 0.625em',
          resize: 'none',
          width: '100%',
          wordBreak: breakAll ? 'break-all' : 'normal',
          '&:disabled': {
            opacity: 0.38,
          },
          '&:focus': {
            boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
            outline: 'none',
          },
        }),
      [css, theme, breakAll],
    );
    return <textarea {...applyClass(props, class_)} ref={ref} spellcheck={false} />;
  },
);

export type ReadOnlyTextAreaProps = {
  breakAll?: boolean;
  disabled?: boolean;
  rows?: number;
  value?: string;
  wrap?: 'soft' | 'off';
} & JSX.IntrinsicElements['div'];

export const ReadOnlyTextArea = forwardRef(
  (
    { breakAll, disabled, rows, value, wrap, ...props }: ReadOnlyTextAreaProps,
    ref: Ref<HTMLDivElement>,
  ) => {
    const innerRef = useInnerRef(ref);
    useLayoutEffect(() => {
      if (disabled) {
        innerRef.current.removeAttribute('tabIndex');
      }
    }, [innerRef, disabled]);

    const css = useCSS();
    const theme = useTheme();
    const class_ = useMemo(
      () =>
        css({
          border: `solid 1px ${theme.textArea.border}`,
          borderRadius: '4px',
          color: theme.text.secondary,
          cursor: disabled ? 'default' : 'auto',
          height: `calc(${1.5 * (rows ?? 2) + 1}em + 2px)`,
          lineHeight: '1.5',
          opacity: disabled ? 0.38 : 1,
          overflow: 'auto',
          padding: '0.5em 0.625em',
          whiteSpace: wrap === 'off' ? 'pre' : 'pre-wrap',
          width: '100%',
          wordBreak: breakAll ? 'break-all' : 'normal',
          '&:focus': {
            boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
            outline: 'none',
          },
        }),
      [css, theme, breakAll, disabled, rows, wrap],
    );

    return (
      <div {...applyClass(props, class_)} ref={innerRef} tabIndex={0}>
        {value}
      </div>
    );
  },
);
