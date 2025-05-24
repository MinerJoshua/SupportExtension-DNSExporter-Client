import { fetchJson } from "../utils/fetchData.js";
import {
  getAllPackages,
  getPackageIDs,
  getZoneFiles,
} from "../utils/api-calls.js";
import { combineDnsResponses } from "../utils/combineJson.js";

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

  return results;
}

export async function handleExportDns(message, sender) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const allPackages = await getAllPackages(controller);
  const sortedPackages = await getPackageIDs(allPackages);
  clearTimeout(timeout);

  if (!Array.isArray(sortedPackages.list)) throw new Error("Invalid response");

  queuedItems = sortedPackages.list.map((id, i) => ({
    id: `item-${i}`,
    name: `Package ${id}`,
    data: { id }, // store ID so it's accessible in DNS call
    status: "queued",
  }));

  processedItems = [];

  const allDnsArray = await processDnsInBatches([...queuedItems], 5); // You can tweak concurrency here
  const combinedDNSRecords = await combineDnsResponses(allDnsArray);
  console.log(combinedDNSRecords);
  await getZoneFiles(combinedDNSRecords);
  //Compress and Send Combined Records to External Server

  return { status: "done", processed: processedItems.length };
}
