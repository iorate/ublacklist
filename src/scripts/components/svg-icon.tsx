import clsx from "clsx";
import styles from "./svg-icon.module.css";

export type SvgIconProps = {
  color?: string | undefined;
  size?: "medium" | "large";
  svg: string;
};

export function SvgIcon({ color, size = "medium", svg }: SvgIconProps) {
  return (
    <span
      aria-hidden={true}
      className={clsx(styles.icon, size === "large" && styles.large)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: svg is a build-time bundled asset, not user input
      dangerouslySetInnerHTML={{ __html: svg }}
      style={color != null ? { color } : undefined}
    />
  );
}
