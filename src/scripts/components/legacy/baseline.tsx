import { useClassName } from "../utilities.ts";

const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

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
