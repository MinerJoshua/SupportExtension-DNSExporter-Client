import { createToolbar } from "./ui.js";
import { setupExportListeners } from './listeners.js';


function init() {
  if (location.pathname === "/" || location.pathname === "") {
    const target = document.querySelector("#homepage-left-column");
    if (target) {
      const shadowRoot = createToolbar(target);
      setupExportListeners(shadowRoot);
    }
  }
}

init();
