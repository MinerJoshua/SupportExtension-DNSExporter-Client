import {
    handleExportAllClick,
    handleExportSelectClick,
    toggleDropdown,
    closeDropdown,
  } from "./actions.js";

  export function setupExportListeners(shadowRoot) {
    const exportBtn = shadowRoot.getElementById("exportBtn");
    const dropdown = shadowRoot.getElementById("exportDropdown");

    if (!exportBtn || !dropdown) return;

    exportBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDropdown(dropdown);
    });

    document.addEventListener("click", () => {
      closeDropdown(dropdown);
    });

    const exportAllBtn = shadowRoot.getElementById("exportAll");
    const exportSelectBtn = shadowRoot.getElementById("exportSelect");

    if (exportAllBtn) {
      exportAllBtn.addEventListener("click", handleExportAllClick);
    }

    if (exportSelectBtn) {
      exportSelectBtn.addEventListener("click", handleExportSelectClick);
    }
  }
  