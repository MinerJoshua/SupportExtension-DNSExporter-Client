// content/ui.js
function createToolbar(targetElement) {
  const host = document.createElement("section");
  host.id = "my-extension-shadow-host";
  host.style.display = "block";
  host.style.marginBottom = "16px";
  if (targetElement.children.length >= 2) {
    targetElement.insertBefore(host, targetElement.children[1]);
  } else {
    targetElement.appendChild(host);
  }
  const shadowRoot = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    .button-container {
    position: relative;
    display: inline-block;
    }

    .button {
    margin-right: 10px;
    padding: 6px 12px;
    background: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    position: relative;
    }

    .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border: 1px solid #ccc;
    display: none;
    flex-direction: column;
    min-width: 180px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    z-index: 100000;
    }

    .dropdown.active {
    display: flex;
    }

    .dropdown button {
    padding: 6px 12px;
    background: white;
    border: none;
    text-align: left;
    cursor: pointer;
    }

    .dropdown button:hover {
    background: #eee;
    }
`;
  const toolbar = document.createElement("div");
  toolbar.classList.add("toolbar");
  toolbar.innerHTML = `
  <div class="button-container">
    <button class="button" id="exportBtn">Export DNS</button>
    <div class="dropdown" id="exportDropdown">
      <button id="exportAll">Export ALL DNS</button>
      <button id="exportSelect">Select DNS to export</button>
    </div>
  </div>
`;
  shadowRoot.appendChild(style);
  shadowRoot.appendChild(toolbar);
  return shadowRoot;
}

// content/actions.js
async function handleExportAllClick() {
  try {
    chrome.runtime.sendMessage({ type: "EXPORT_DNS" }, (response) => {
      if (response?.status === "done") {
        console.log("DNS Export Complete:", response.data);
      } else if (response?.status === "error") {
        console.error("DNS Export Failed:", response.message);
      }
    });
    alert("DNS export completed!");
  } catch (err) {
    chrome.runtime.sendMessage({
      type: "EXPORT_ERROR",
      payload: { message: err.message, time: /* @__PURE__ */ new Date() }
    });
    alert(`Export failed: ${err.message}`);
  }
}
function handleExportSelectClick() {
  alert("Feature coming soon.");
}
function toggleDropdown(dropdown) {
  dropdown.classList.toggle("active");
}
function closeDropdown(dropdown) {
  dropdown.classList.remove("active");
}

// content/listeners.js
function setupExportListeners(shadowRoot) {
  const exportBtn = shadowRoot.getElementById("exportBtn");
  const dropdown = shadowRoot.getElementById("exportDropdown");
  if (!exportBtn || !dropdown)
    return;
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

// content/index.js
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
