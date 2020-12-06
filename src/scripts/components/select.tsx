import menuDown from '@mdi/svg/svg/menu-down.svg';
import { JSX, createContext, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useContext, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { Icon } from './icon';
import { useCSS } from './styles';
import { useTheme } from './theme';

const SelectContext = createContext<{ native?: boolean }>({});

export type SelectProps = { native?: boolean } & JSX.IntrinsicElements['select'];

export const Select = forwardRef(
  ({ native, ...props }: SelectProps, ref: Ref<HTMLSelectElement>) => {
    const css = useCSS();
    const theme = useTheme();
    const wrapperClass = useMemo(
      () =>
        css({
          position: 'relative',
        }),
      [css],
    );
    const selectClass = useMemo(
      () =>
        css({
          appearance: 'none',
          background: 'transparent',
          border: `solid 1px ${theme.select.border}`,
          borderRadius: '4px',
          color: theme.text.primary,
          cursor: 'pointer',
          display: 'block',
          fontFamily: 'inherit',
          fontSize: '1em',
          lineHeight: '1.5',
          padding: `0.5em calc(0.625em + 24px) 0.5em 0.625em`,
          width: '15em',
          '&:disabled': {
            cursor: 'default',
            opacity: 0.38,
          },
          '&:focus': {
            boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
            outline: 'none',
          },
        }),
      [css, theme],
    );
    const arrowClass = useMemo(
      () =>
        css({
          pointerEvents: 'none',
          position: 'absolute',
          right: '1px',
          top: 'calc((100% - 24px) / 2)',
        }),
      [css],
    );
    return (
      <SelectContext.Provider value={{ native }}>
        <div class={wrapperClass}>
          <select {...applyClass(props, selectClass)} ref={ref} />
          <div class={arrowClass}>
            <Icon color={theme.select.arrow} iconSize="24px" url={menuDown} />
          </div>
        </div>
      </SelectContext.Provider>
    );
  },
);

export type SelectOptionProps = JSX.IntrinsicElements['option'];

export const SelectOption = forwardRef((props: SelectOptionProps, ref: Ref<HTMLOptionElement>) => {
  const { native } = useContext(SelectContext);
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        background: native ? 'transparent' : theme.select.optionBackground,
        color: native ? 'initial' : 'inherit',
      }),
    [native, css, theme],
  );
  return <option {...applyClass(props, class_)} ref={ref} />;
});
