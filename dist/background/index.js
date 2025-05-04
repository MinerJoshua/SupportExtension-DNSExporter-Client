// background/utils/fetchData.js
async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

// background/handlers/exportDns.js
async function handleExportDns(message, sender) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15e3);
  const [dnsRecords] = await Promise.all([
    fetchJson("https://my.20i.com/a/package?fields%5B%5D=names", {
      credentials: "include",
      signal: controller.signal
    })
  ]);
  clearTimeout(timeout);
  console.log(dnsRecords);
  chrome.runtime.sendMessage({
    type: "EXPORT_DNS_COMPLETE",
    payload: { success: true }
  });
  return { status: "done" };
}

// background/index.js
var handlers = {
  EXPORT_DNS: handleExportDns
};
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handler = handlers[message.type];
  if (handler) {
    handler(message, sender).then((result) => sendResponse(result)).catch((err) => {
      console.error(err);
      sendResponse({ status: "error", message: err.message });
    });
    return true;
  } else {
    sendResponse({ status: "error", message: "Unknown message type" });
  }
});
