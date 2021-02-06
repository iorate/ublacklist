import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo, useRef } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type TextAreaProps = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  breakAll?: boolean;
} & JSX.IntrinsicElements['textarea'];

export const TextArea = forwardRef(
  ({ breakAll = false, ...props }: TextAreaProps, ref: Ref<HTMLTextAreaElement>) => {
    const defaultValue = useRef<string | null>(null);
    if (defaultValue.current == null && props.value != null) {
      defaultValue.current = props.value as string;
    }
    if (defaultValue.current != null) {
      (props as { defaultValue?: string }).defaultValue = defaultValue.current;
    }

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
          font: 'inherit',
          height: props.rows != null ? `calc(1.5em * ${props.rows} + 1em + 2px)` : 'auto',
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
          '&:read-only': {
            color: theme.text.secondary,
          },
        }),
      [css, theme, breakAll, props.rows],
    );
    return <textarea {...applyClass(props, class_)} ref={ref} />;
  },
);
