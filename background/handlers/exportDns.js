import { fetchJson } from "../utils/fetchData.js";
//import { combineResponses } from '../utils/combineResponses.js';

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

  // Create N workers to process concurrently
  const workers = Array(concurrency)
    .fill()
    .map(() => worker());
  await Promise.all(workers);

  console.log(results);
  return results;
}

export async function handleExportDns(message, sender) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const [allPackages] = await Promise.all([
    fetchJson(
      "https://my.20i.com/a/package?fields%5B%5D=names&fields%5B%5D=id",
      {
        credentials: "include",
        signal: controller.signal,
      }
    ),
  ]);

  clearTimeout(timeout);

  const [sortedPackages] = await Promise.all([
    fetchJson(
      "https://dns-exporter.joshuaminer.uk/build_domain_package_list.py",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allPackages),
      }
    ),
  ]);

  if (!Array.isArray(sortedPackages)) throw new Error("Invalid response");

  console.log(sortedPackages);
  queuedItems = sortedPackages.list.map((id, i) => ({
    id: `item-${i}`,
    name: `Package ${id}`,
    data: { id }, // store ID so it's accessible in DNS call
    status: "queued",
  }));


  processedItems = [];

  await processDnsInBatches([...queuedItems], 5); // You can tweak concurrency here
  /* 
  const selectedPackages = allPackages.reduce((acc, item) => {
    acc[item.id] = item.names;
    return acc;
  }, {});

  console.log(selectedPackages); */
  //const combined = combineResponses(dnsRecords, metadata);

  //  chrome.runtime.sendMessage({
  //    type: 'EXPORT_DNS_COMPLETE',
  //    payload: { success: true },
  //  });

  return { status: "done", processed: processedItems.length };
}
