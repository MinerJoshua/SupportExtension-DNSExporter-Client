export function createToolbar(targetElement) {
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
