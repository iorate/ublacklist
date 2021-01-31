import { FunctionComponent, h } from 'preact';
import { Ref, useLayoutEffect, useMemo, useRef } from 'preact/hooks';
import { useCSS } from './styles';
import { useTheme } from './theme';

export function applyClass<Props extends { class?: string }>(props: Props, class_: string): Props {
  return {
    ...props,
    class: `${class_}${props.class != null ? ` ${props.class}` : ''}`,
  };
}

// https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd
export function useInnerRef<T>(ref: Ref<T>): Ref<T> {
  const innerRef = useRef<T>();
  useLayoutEffect(() => {
    if (ref) {
      ref.current = innerRef.current;
    }
  }, [ref]);
  return innerRef;
}

export const FocusCircle: FunctionComponent<{ depth?: number }> = ({ depth = 0 }) => {
  const css = useCSS();
  const theme = useTheme();
  const focusCircleClass = useMemo(
    () =>
      css({
        borderRadius: '50%',
        height: '40px',
        left: `calc(50% - 20px)`,
        pointerEvents: 'none',
        position: 'absolute',
        top: `calc(50% - 20px)`,
        width: '40px',
        [`:focus-visible + ${'* > '.repeat(depth)}&`]: {
          background: theme.focus.circle,
        },
        [`:-moz-focusring + ${'* > '.repeat(depth)}&`]: {
          background: theme.focus.circle,
        },
      }),
    [css, theme, depth],
  );
  return <div class={focusCircleClass} />;
};
