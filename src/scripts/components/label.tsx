import { JSX, createContext, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useContext, useMemo } from 'preact/hooks';
import { DISABLED_OPACITY } from './constants';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

type LabelContextValue = { disabled?: boolean };

const LabelContext = createContext<LabelContextValue | null>(null);

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

export const LabelWrapper = forwardRef(
  ({ disabled, fullWidth, ...props }: LabelWrapperProps, ref: Ref<HTMLDivElement>) => {
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
      <LabelContext.Provider value={{ disabled: disabled }}>
        <div {...applyClass(props, class_)} ref={ref} />
      </LabelContext.Provider>
    );
  },
);

export type LabelProps = JSX.IntrinsicElements['span'];

export const Label = forwardRef((props: LabelProps, ref: Ref<HTMLSpanElement>) => {
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

export const ControlLabel = forwardRef(
  ({ children, for: for_, ...props }: ControlLabelProps, ref: Ref<HTMLLabelElement>) => {
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
        <label {...applyClass(props, class_)} for={for_} ref={ref}>
          {children}
        </label>
      </div>
    );
  },
);

export type SubLabelProps = JSX.IntrinsicElements['span'];

export const SubLabel = forwardRef((props: SubLabelProps, ref: Ref<HTMLSpanElement>) => {
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
