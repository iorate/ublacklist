import * as goober from 'goober';
import { FunctionComponent, h } from 'preact';
import { Ref, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
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

export function useModal(open: boolean, focus: () => void): void {
  const prevOpen = useRef(false);
  const [prevFocus, setPrevFocus] = useState<Element | null>(null);
  const rootClass = useMemo(
    () =>
      goober.css({
        overflow: 'hidden !important',
      }),
    [],
  );
  useLayoutEffect(() => {
    if (open) {
      if (!prevOpen.current) {
        setPrevFocus(document.activeElement);
        focus();
        document.documentElement.classList.add(rootClass);
      }
    } else if (prevOpen.current && prevFocus instanceof HTMLElement) {
      prevFocus.focus();
      document.documentElement.classList.remove(rootClass);
    }
    prevOpen.current = open;
  }, [open, focus, prevFocus, rootClass]);
}

export const FocusCircle: FunctionComponent<{ depth: number; size: string }> = ({
  depth,
  size,
}) => {
  const css = useCSS();
  const theme = useTheme();
  const focusCircleClass = useMemo(
    () =>
      css({
        borderRadius: '50%',
        display: 'block',
        height: '40px',
        left: `calc(${size} / 2 - 20px)`,
        pointerEvents: 'none',
        position: 'absolute',
        top: `calc(${size} / 2 - 20px)`,
        width: '40px',
        [`:focus-visible ~ ${'* > '.repeat(depth)}&`]: {
          background: theme.focus.circle,
        },
        [`:-moz-focusring ~ ${'* > '.repeat(depth)}&`]: {
          background: theme.focus.circle,
        },
      }),
    [css, theme, depth, size],
  );
  return <span class={focusCircleClass} />;
};
