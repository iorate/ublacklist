import { useLayoutEffect, useRef } from "react";
import { useClassName } from "./utilities.ts";

export function applyClassName<
  Props extends { className?: string | undefined },
>(props: Props, className: string): Props {
  return {
    ...props,
    className: `${className}${props.className ? ` ${props.className}` : ""}`,
  };
}

// https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd
export function useInnerRef<T>(
  ref: ((instance: T | null) => void) | React.MutableRefObject<T | null> | null,
): React.RefObject<T> {
  const innerRef = useRef<T>(null);
  useLayoutEffect(() => {
    if (ref && typeof ref === "object" && innerRef.current != null) {
      ref.current = innerRef.current;
    }
  }, [ref]);
  return innerRef;
}

export const FocusCircle: React.FC<{ depth?: number }> = ({ depth = 0 }) => {
  const className = useClassName(
    (theme) => ({
      borderRadius: "50%",
      height: "40px",
      left: "calc(50% - 20px)",
      pointerEvents: "none",
      position: "absolute",
      top: "calc(50% - 20px)",
      width: "40px",
      [`:focus + ${"* > ".repeat(depth)}&`]: {
        background: theme.focus.circle,
      },
      [`:focus:not(:focus-visible) + ${"* > ".repeat(depth)}&`]: {
        background: "transparent",
      },
      [`:focus:not(:-moz-focusring) + ${"* > ".repeat(depth)}&`]: {
        background: "transparent",
      },
    }),
    [depth],
  );
  return <div className={className} />;
};
