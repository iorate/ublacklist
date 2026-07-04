import { useClassName } from "../utilities.ts";

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
