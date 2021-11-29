import React, { useMemo } from 'react';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type TextProps = { primary?: boolean } & JSX.IntrinsicElements['span'];

export const Text = React.forwardRef<HTMLSpanElement, TextProps>(function Text(
  { primary = false, ...props },
  ref,
) {
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
