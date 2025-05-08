import iconSVG from "../../icons/icon.svg";

export type ButtonProps = {
  ariaLabel: string;
  onClick: () => void;
};

export function createButton(props: ButtonProps): HTMLElement {
  const host = document.createElement("div");
  const shadowRoot = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = [
    "button { background: transparent; border: none; cursor: pointer; display: inline-flex; padding: 8px; }",
    "svg { width: 24px; height: 24px; }",
  ].join(" ");
  shadowRoot.appendChild(style);

  const button = document.createElement("button");
  button.type = "button";
  button.ariaLabel = props.ariaLabel;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    props.onClick();
  });
  button.innerHTML = iconSVG;
  shadowRoot.appendChild(button);

  return host;
}
