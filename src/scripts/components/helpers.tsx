import { useLayoutEffect, useRef } from "react";

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
  ref: ((instance: T | null) => void) | React.RefObject<T | null> | null,
): React.RefObject<T> {
  const innerRef = useRef<T>(null);
  useLayoutEffect(() => {
    if (ref && typeof ref === "object" && innerRef.current != null) {
      ref.current = innerRef.current;
    }
  }, [ref]);
  return innerRef as React.RefObject<T>;
}
