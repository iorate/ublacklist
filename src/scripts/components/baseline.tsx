import { useLayoutEffect } from "react";
import { useGlob } from "./styles.tsx";
import { useClassName } from "./utilities.ts";

const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

export type BaseLineProps = { children?: React.ReactNode; fontSize?: string };

export const Baseline: React.FC<BaseLineProps> = ({
  children,
  fontSize = "13px",
}) => {
  const rootClassName = useClassName(
    (theme) => ({
      colorScheme: theme.name,
    }),
    [],
  );
  const bodyClassName = useClassName(
    (theme) => ({
      background: theme.background,
      color: theme.text.primary,
      margin: 0,
      fontFamily,
      fontSize,
      lineHeight: 1.5,
    }),
    [fontSize],
  );
  useLayoutEffect(() => {
    document.documentElement.classList.add(rootClassName);
    document.body.classList.add(bodyClassName);
    return () => {
      document.documentElement.classList.remove(rootClassName);
      document.body.classList.remove(bodyClassName);
    };
  }, [rootClassName, bodyClassName]);

  const glob = useGlob();
  useLayoutEffect(() => {
    glob({
      "*, *::before, *::after": {
        boxSizing: "border-box",
      },
    });
  }, [glob]);

  return <>{children}</>;
};

export type ScopedBaselineProps = {
  children?: React.ReactNode;
  fontSize?: string;
};

export const ScopedBaseline: React.FC<ScopedBaselineProps> = ({
  children,
  fontSize = "13px",
}) => {
  const className = useClassName(
    (theme) => ({
      color: theme.text.primary,
      colorScheme: theme.name,
      fontFamily,
      fontSize,
      lineHeight: 1.5,
      "& *, & *::before, & *::after": {
        boxSizing: "border-box",
      },
    }),
    [fontSize],
  );
  return <div className={className}>{children}</div>;
};
