import { JSX, createContext, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useContext, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

const LabelContext = createContext<{ disabled?: boolean; for?: string }>({});

export type LabelProps = {
  disabled?: boolean;
  for?: string;
  forFullWidth?: boolean;
} & JSX.IntrinsicElements['div'];

export const Label = forwardRef(
  ({ disabled, for: for_, forFullWidth, ...props }: LabelProps, ref: Ref<HTMLDivElement>) => {
    const css = useCSS();
    const labelClass = useMemo(
      () =>
        css({
          marginBottom: forFullWidth ? '0.5em' : 0,
          opacity: disabled ? 0.38 : 1,
        }),
      [css, disabled, forFullWidth],
    );
    return (
      <LabelContext.Provider value={{ disabled: disabled, for: for_ }}>
        <div {...applyClass(props, labelClass)} ref={ref} />
      </LabelContext.Provider>
    );
  },
);

export type LabelItemProps = { primary?: boolean } & JSX.IntrinsicElements['label'];

export const LabelItem = forwardRef(
  ({ primary, ...props }: LabelItemProps, ref: Ref<HTMLLabelElement>) => {
    const { disabled, for: for_ } = useContext(LabelContext);

    const css = useCSS();
    const theme = useTheme();
    const wrapperClass = useMemo(
      () =>
        css({
          color: primary ? theme.text.primary : theme.text.secondary,
        }),
      [css, theme, primary],
    );
    const labelClass = useMemo(
      () =>
        css({
          cursor: disabled || for_ == null ? 'default' : 'pointer',
        }),
      [css, disabled, for_],
    );

    return (
      <div class={wrapperClass}>
        <label {...applyClass(props, labelClass)} for={for_} ref={ref} />
      </div>
    );
  },
);
