import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useCSS } from './styles';
import { useTheme } from './theme';

export function applyClass<Props extends { className?: string | undefined }>(
  props: Props,
  class_: string,
): Props {
  return {
    ...props,
    className: `${class_}${props.className != null ? ` ${props.className}` : ''}`,
  };
}

// https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd
export function useInnerRef<T>(
  ref: ((instance: T | null) => void) | React.MutableRefObject<T | null> | null,
): React.RefObject<T> {
  const innerRef = useRef<T>(null);
  useLayoutEffect(() => {
    if (ref && typeof ref === 'object' && innerRef.current != null) {
      ref.current = innerRef.current;
    }
  }, [ref]);
  return innerRef;
}

export const FocusCircle: React.VFC<{ depth?: number }> = ({ depth = 0 }) => {
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
        [`:focus + ${'* > '.repeat(depth)}&`]: {
          background: theme.focus.circle,
        },
        [`:focus:not(:focus-visible) + ${'* > '.repeat(depth)}&`]: {
          background: 'transparent',
        },
        [`:focus:not(:-moz-focusring) + ${'* > '.repeat(depth)}&`]: {
          background: 'transparent',
        },
      }),
    [css, theme, depth],
  );
  return <div className={focusCircleClass} />;
};
