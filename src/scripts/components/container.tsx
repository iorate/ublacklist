import React from "react";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type ContainerProps = JSX.IntrinsicElements["div"] & { width?: string };

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ width = "640px", ...props }, ref) {
    const wrapperClassName = useClassName(
      () => ({
        bottom: 0,
        left: 0,
        overflow: "auto",
        position: "fixed",
        right: 0,
        top: 0,
      }),
      [],
    );
    const containerClassName = useClassName(
      () => ({
        margin: "0 auto",
        maxWidth: "100%",
        padding: "2em 0",
        width,
      }),
      [width],
    );
    return (
      <div className={wrapperClassName}>
        <div {...applyClassName(props, containerClassName)} ref={ref} />
      </div>
    );
  },
);
