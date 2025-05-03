import { createToolbar } from "./ui.js";
import { setupExportHandlers } from "./actions.js";

function init() {
  if (location.pathname === "/" || location.pathname === "") {
    const target = document.querySelector("#homepage-left-column");
    if (target) {
      const shadowRoot = createToolbar(target);
      setupExportHandlers(shadowRoot);
    }
  }
}

init();
