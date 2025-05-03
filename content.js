function runLoginCheck() {
  fetch("https://my.20i.com/a/package", {
    credentials: "include"
  })
    .then(res => {
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
console.log("Checking for element...");
console.log(document.querySelector('#homepage-right-column'));
/* // Check again if SPA URL changes (React Router, etc.)
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log("URL changed, rechecking login...");
    runLoginCheck();
  }
}).observe(document, { subtree: true, childList: true }); */


const targetElement = document.querySelector('#homepage-right-column');

if (targetElement) {
  const host = document.createElement('section');
  host.id = 'my-extension-shadow-host';
  targetElement.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'open' });

  // (Continue with the same style/HTML injection logic here)
  // Style
  const style = document.createElement('style');
  style.textContent = `
    .toolbar {
      display: flex;
      background: #f0f0f0;
      padding: 8px;
      border: 1px solid #ccc;
      font-family: sans-serif;
      position: fixed;
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
  const toolbar = document.createElement('div');
  toolbar.classList.add('toolbar');
  toolbar.innerHTML = `
    <button class="button" id="exportBtn">
      Export DNS
      <div class="dropdown" id="exportDropdown">
        <button id="exportAll">Export ALL DNS</button>
        <button id="exportSelect">Select DNS to export</button>
      </div>
    </button>
  `;

  // Append to Shadow DOM
  shadowRoot.appendChild(style);
  shadowRoot.appendChild(toolbar);

  // Dropdown toggle logic
  const exportBtn = toolbar.querySelector('#exportBtn');
  const dropdown = toolbar.querySelector('#exportDropdown');

  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event bubbling
    dropdown.classList.toggle('active');
  });

  // Hide dropdown on outside click
  document.addEventListener('click', () => {
    dropdown.classList.remove('active');
  });

  // Handle export options
  shadowRoot.getElementById('exportAll').addEventListener('click', () => {
    console.log('Exporting ALL DNS...');
  });

  shadowRoot.getElementById('exportSelect').addEventListener('click', () => {
    console.log('Opening selection interface...');
  });

}


