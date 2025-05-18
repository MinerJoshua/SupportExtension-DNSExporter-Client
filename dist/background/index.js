// background/utils/fetchData.js
async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

// background/utils/api-calls.js
async function getAllPackages(controller) {
  const url = "https://my.20i.com/a/package?fields%5B%5D=names&fields%5B%5D=id";
  return await fetchJson(url, {
    credentials: "include",
    signal: controller?.signal
  });
}
async function getPackageIDs(Packages) {
  const url = "https://dns-exporter.joshuaminer.uk/build_domain_package_list.py";
  return await fetchJson(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(Packages)
  });
}

// background/utils/combineJson.js
function combineDnsResponses(...responses) {
  const combined = {};
  for (const response of responses) {
    console.log(response);
    for (const domain in response) {
      const recordSet = response[domain];
      if (recordSet && Array.isArray(recordSet.records) && recordSet.records.length > 0) {
        combined[domain] = recordSet.records;
      }
    }
  }
  return combined;
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
  return results;
}
async function handleExportDns(message, sender) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1e4);
  try {
    const allPackages = await getAllPackages(controller);
    const sortedPackages2 = await getPackageIDs(allPackages);
    clearTimeout(timeout);
  } catch (error) {
    console.error("API error:", error);
    clearTimeout(timeout);
  }
  if (!Array.isArray(sortedPackages.list))
    throw new Error("Invalid response");
  queuedItems = sortedPackages.list.map((id, i) => ({
    id: `item-${i}`,
    name: `Package ${id}`,
    data: { id },
    // store ID so it's accessible in DNS call
    status: "queued"
  }));
  processedItems = [];
  const allDnsArray = await processDnsInBatches([...queuedItems], 5);
  const combinedDNSRecords = combineDnsResponses(allDnsArray);
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
