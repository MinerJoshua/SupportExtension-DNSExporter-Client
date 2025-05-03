export function setupExportHandlers(shadowRoot) {
  const exportBtn = shadowRoot.getElementById("exportBtn");
  const dropdown = shadowRoot.getElementById("exportDropdown");

  exportBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("active");
  });

  shadowRoot.getElementById("exportAll").addEventListener("click", async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

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
          time: new Date(),
          size: JSON.stringify(data).length,
        },
      });

      alert("DNS export completed!");
    } catch (err) {
      chrome.runtime.sendMessage({
        type: "EXPORT_ERROR",
        payload: { message: err.message, time: new Date() },
      });
      alert(`Export failed: ${err.message}`);
    }
  });

  shadowRoot.getElementById("exportSelect").addEventListener("click", () => {
    alert("Feature coming soon.");
  });
}
