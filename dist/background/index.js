// background/utils/fetchData.js
async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

// background/handlers/exportDns.js
async function processDnsInBatches(items, concurrency = 5) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const item = items[index++];
      try {
        const data = await fetchJson(
          `https://my.20i.com/a/package/${item.data.id}/dns`
        );
        results.push({ ...item, status: "success", result: data });
        processedItems.push({ ...item, status: "success" });
      } catch (err) {
        results.push({ ...item, status: "fail" });
        processedItems.push({ ...item, status: "fail" });
      }
      queuedItems = queuedItems.filter((q) => q.id !== item.id);
    }
  }
  const workers = Array(concurrency).fill().map(() => worker());
  await Promise.all(workers);
  console.log(results);
  return results;
}
async function handleExportDns(message, sender) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15e3);
  const [allPackages] = await Promise.all([
    fetchJson(
      "https://my.20i.com/a/package?fields%5B%5D=names&fields%5B%5D=id",
      {
        credentials: "include",
        signal: controller.signal
      }
    )
  ]);
  clearTimeout(timeout);
  const [sortedPackages] = await Promise.all([
    fetchJson(
      "https://dns-exporter.joshuaminer.uk/build_domain_package_list.py",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(allPackages)
      }
    )
  ]);
  if (!Array.isArray(sortedPackages))
    throw new Error("Invalid response");
  console.log(sortedPackages);
  queuedItems = sortedPackages.list.map((id, i) => ({
    id: `item-${i}`,
    name: `Package ${id}`,
    data: { id },
    // store ID so it's accessible in DNS call
    status: "queued"
  }));
  processedItems = [];
  await processDnsInBatches([...queuedItems], 5);
  return { status: "done", processed: processedItems.length };
}

// background/index.js
var handlers = {
  EXPORT_DNS: handleExportDns
  // FETCH_COMBINED_DATA: handleFetchData,
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
