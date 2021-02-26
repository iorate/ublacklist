import { useRef } from 'preact/hooks';

export function usePrevious<T>(value: T): T | undefined;
export function usePrevious<T>(value: T, defaultValue: T): T;
export function usePrevious<T>(value: T, defaultValue?: T): T | undefined {
  const previousRef = useRef(defaultValue);
  const previous = previousRef.current;
  previousRef.current = value;
  return previous;
}
