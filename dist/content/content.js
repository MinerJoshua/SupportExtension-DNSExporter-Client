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
  style.textContent = `/* your styles here */`;
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
function setupExportHandlers(shadowRoot) {
  const exportBtn = shadowRoot.getElementById("exportBtn");
  const dropdown = shadowRoot.getElementById("exportDropdown");
  exportBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  });
  document.addEventListener("click", () => dropdown.classList.remove("active"));
  shadowRoot.getElementById("exportAll").addEventListener("click", async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15e3);
      const res = await fetch("https://your-api.example.com/export/all", {
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      chrome.runtime.sendMessage({
        type: "EXPORT_SUCCESS",
        payload: {
          status: "done",
          time: /* @__PURE__ */ new Date(),
          size: JSON.stringify(data).length,
        },
      });
      alert("DNS export completed!");
    } catch (err) {
      chrome.runtime.sendMessage({
        type: "EXPORT_ERROR",
        payload: { message: err.message, time: /* @__PURE__ */ new Date() },
      });
      alert(`Export failed: ${err.message}`);
    }
  });
  shadowRoot.getElementById("exportSelect").addEventListener("click", () => {
    alert("Feature coming soon.");
  });
}

// content/content.js
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
