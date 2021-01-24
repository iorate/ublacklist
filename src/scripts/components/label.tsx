import { JSX, createContext, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useContext, useMemo } from 'preact/hooks';
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
          opacity: disabled ? 0.38 : 1,
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

export type LabelProps = { focus?: string } & JSX.IntrinsicElements['label'];

export const Label = forwardRef(({ focus, ...props }: LabelProps, ref: Ref<HTMLLabelElement>) => {
  const { disabled } = useLabelContext();

  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        color: theme.text.primary,
        cursor: disabled ? 'default' : focus == null && props.for == null ? 'auto' : 'pointer',
      }),
    [css, theme, disabled, focus, props.for],
  );

  return (
    <div>
      <label
        {...applyClass(props, class_)}
        ref={ref}
        onClick={e => {
          if (!disabled && focus != null) {
            const root = e.currentTarget.getRootNode() as HTMLDocument | ShadowRoot;
            root.querySelector<HTMLElement>(`#${focus}`)?.focus();
          }
        }}
      />
    </div>
  );
});

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
