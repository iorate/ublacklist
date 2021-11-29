import React, { useContext, useMemo } from 'react';
import { DISABLED_OPACITY } from './constants';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

type LabelContextValue = { disabled: boolean };

const LabelContext = React.createContext<LabelContextValue | null>(null);

function useLabelContext(): LabelContextValue {
  const value = useContext(LabelContext);
  if (!value) {
    throw new Error('useLabelContext: no matching provider');
  }
  return value;
}

export type LabelWrapperProps = {
  disabled?: boolean;
  fullWidth?: boolean;
} & JSX.IntrinsicElements['div'];

export const LabelWrapper = React.forwardRef<HTMLDivElement, LabelWrapperProps>(
  function LabelWrapper({ disabled = false, fullWidth = false, ...props }, ref) {
    const css = useCSS();
    const class_ = useMemo(
      () =>
        css({
          marginBottom: fullWidth ? '0.5em' : 0,
          opacity: disabled ? DISABLED_OPACITY : 1,
        }),
      [css, disabled, fullWidth],
    );
    return (
      <LabelContext.Provider value={{ disabled }}>
        <div {...applyClass(props, class_)} ref={ref} />
      </LabelContext.Provider>
    );
  },
);

export type LabelProps = JSX.IntrinsicElements['span'];

export const Label = React.forwardRef<HTMLSpanElement, LabelProps>(function Label(props, ref) {
  const { disabled } = useLabelContext();

  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        color: theme.text.primary,
        cursor: disabled ? 'default' : 'auto',
      }),
    [css, theme, disabled],
  );

  return (
    <div>
      <span {...applyClass(props, class_)} ref={ref} />
    </div>
  );
});

export type ControlLabelProps = { for: string } & JSX.IntrinsicElements['label'];

export const ControlLabel = React.forwardRef<HTMLLabelElement, ControlLabelProps>(
  function ControlLabel({ children, for: for_, ...props }, ref) {
    const { disabled } = useLabelContext();

    const css = useCSS();
    const theme = useTheme();
    const class_ = useMemo(
      () =>
        css({
          color: theme.text.primary,
          cursor: disabled ? 'default' : 'pointer',
        }),
      [css, theme, disabled],
    );

    return (
      <div>
        <label {...applyClass(props, class_)} htmlFor={for_} ref={ref}>
          {children}
        </label>
      </div>
    );
  },
);

export type SubLabelProps = JSX.IntrinsicElements['span'];

export const SubLabel = React.forwardRef<HTMLSpanElement, SubLabelProps>(function SubLabel(
  props,
  ref,
) {
  const { disabled } = useLabelContext();

  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        color: theme.text.secondary,
        cursor: disabled ? 'default' : 'auto',
      }),
    [css, theme, disabled],
  );

  return (
    <div>
      <span {...applyClass(props, class_)} ref={ref} />
    </div>
  );
});
