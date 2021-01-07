import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type TextProps = { primary?: boolean } & JSX.IntrinsicElements['span'];

export const Text = forwardRef(({ primary, ...props }: TextProps, ref: Ref<HTMLSpanElement>) => {
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        color: primary ? theme.text.primary : theme.text.secondary,
      }),
    [css, theme, primary],
  );
  return <span {...applyClass(props, class_)} ref={ref} />;
});
