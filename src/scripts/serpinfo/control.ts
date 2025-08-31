import { Draggable } from "@neodrag/vanilla";
import iconSVG from "../../icons/icon.svg";
import { blockedResultCountStore } from "./filter.ts";
import { storageStore } from "./storage-store.ts";
import { hideBlockedResultsStore } from "./style.ts";

function create() {
  const host = document.createElement("div");
  host.dataset.ubControl = "1";
  const shadowRoot = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    :host {
      position: fixed;
      top: 4px;
      right: 4px;
      z-index: 99999;
    }
    button {
      background: white;
      border: none;
      border-radius: 4px;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.12), 2px 2px 2px rgba(0, 0, 0, 0.24);
      cursor: pointer;
      display: inline-flex;
      gap: 4px;
      padding: 4px;
    }
    svg {
      width: 20px;
      height: 20px;
    }
    span {
      color: black;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 20px;
    }
  `
    .replaceAll(/\s+/g, " ")
    .trim();
  shadowRoot.appendChild(style);

  const button = document.createElement("button");
  button.type = "button";
  button.ariaLabel = "aria-label";
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    hideBlockedResultsStore.setState((prev) => !prev);
  });
  button.insertAdjacentHTML("beforeend", iconSVG);
  const span = document.createElement("span");
  button.appendChild(span);
  shadowRoot.appendChild(button);

  document.body.appendChild(host);

  const update = () => {
    button.style.opacity =
      !storageStore.getState().hideControl &&
      blockedResultCountStore.getState() > 0
        ? hideBlockedResultsStore.getState()
          ? "1"
          : "0.4"
        : "0";
    span.textContent = blockedResultCountStore.getState().toString();
  };
  update();
  hideBlockedResultsStore.subscribe(update);
  blockedResultCountStore.subscribe(update);
  storageStore.subscribe((state) => state.hideControl, update);

  new Draggable(button);
}

export function control() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      create();
    });
  } else {
    return create();
  }
}
