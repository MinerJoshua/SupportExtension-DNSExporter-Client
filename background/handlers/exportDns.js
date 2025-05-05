import { fetchJson } from '../utils/fetchData.js';
//import { combineResponses } from '../utils/combineResponses.js';

export async function handleExportDns(message, sender) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const [allPackages] = await Promise.all([
    fetchJson("https://my.20i.com/a/package?fields%5B%5D=names&fields%5B%5D=id", {
      credentials: "include",
      signal: controller.signal,
    })
  ]);

  clearTimeout(timeout);

  const selectedPackages = allPackages.reduce((acc, item) => {
    acc[item.id] = item.names;
    return acc;
  }, {});

  console.log(selectedPackages);
  //const combined = combineResponses(dnsRecords, metadata);

//  chrome.runtime.sendMessage({
//    type: 'EXPORT_DNS_COMPLETE',
//    payload: { success: true },
//  });

  return { status: 'done' };
}
