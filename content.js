function runLoginCheck() {
  fetch("https://my.20i.com/a/package", {
    credentials: "include",
  })
    .then((res) => {
      const status = res.ok ? "logged_in" : "not_logged_in";
      console.log("Login check result:", status);
      chrome.runtime.sendMessage({ status });
    })
    .catch(() => {
      console.log("Login check failed, assuming not logged in");
      chrome.runtime.sendMessage({ status: "not_logged_in" });
    });
}

// Always check once on script load (i.e. page refresh)
runLoginCheck();

const isRootWithOptionalQuery =
  location.pathname === "/" || location.pathname === "";

if (isRootWithOptionalQuery) {
  const targetElement = document.querySelector("#homepage-left-column");

  if (targetElement) {
    const host = document.createElement("section");
    host.id = "my-extension-shadow-host";

    if (targetElement.children.length >= 2) {
      targetElement.insertBefore(host, targetElement.children[1]);
    } else {
      targetElement.appendChild(host);
    }

    const shadowRoot = host.attachShadow({ mode: "open" });

    // Style
    const style = document.createElement("style");
    style.textContent = `
      .toolbar {
        display: flex;
        background: #f9f9f9;
        padding: 10px;
        border: 1px solid #ccc;
        font-family: sans-serif;
        margin-bottom: 16px;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);

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

      .button-container {
        position: relative;
        display: inline-block;
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

    // Toolbar HTML
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

    // Append to Shadow DOM
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(toolbar);

    // Dropdown toggle logic
    const exportBtn = toolbar.querySelector("#exportBtn");
    const dropdown = toolbar.querySelector("#exportDropdown");

    exportBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    });

    // Hide dropdown on outside click
    document.addEventListener("click", () => {
      dropdown.classList.remove("active");
    });

    // Handle export options
    shadowRoot.getElementById("exportAll").addEventListener("click", () => {
      console.log("Exporting ALL DNS...");
    });

    shadowRoot.getElementById("exportSelect").addEventListener("click", () => {
      console.log("Opening selection interface...");
    });
  }
} else {
  console.log("Not on root — skipping injection.");
}
