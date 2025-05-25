import { fetchJson } from "../utils/fetchData.js";

/**
 * Fetches all hosting packages from the my20i API.
 *
 * @param {AbortController} [controller] - Optional AbortController for request timeout.
 * @returns {Promise<Object>} The list of packages.
 */
export async function getAllPackages(controller) {
  const url = "https://my.20i.com/a/package?fields%5B%5D=names&fields%5B%5D=id";
  return await fetchJson(url, {
    compress: true,
    credentials: "include",
    signal: controller?.signal,
  });
}

/**
 * Post the packages to external server for processing to list of Package IDs
 *
 * @param {Packages} [Packages] - Json Response from getAllPackages.
 * @returns {Promise<Object>} Json Response with List of Package IDs
 */
export async function getPackageIDs(Packages) {
  const url =
    "https://dns-exporter.joshuaminer.uk/build_domain_package_list.py";
  return await fetchJson(url, {
    method: "POST",
    compress: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Packages),
  });
}

// /**
//  * Post the packages to external server for processing to list of Package IDs
//  *
//  * @param {combinedDnsRecordsJson} [combinedDnsRecordsJson] - Json Response from getAllPackages.
//  * @returns {Promise<Object>} Json Response with URl to download Zone File
//  */
// export async function getZoneFiles(combinedDnsRecordsJson) {
//   const url = "https://dns-exporter.joshuaminer.uk/convert_json_to_zonefile.py";
//   return await fetchJson(url, {
//     method: "POST",
//     compress: true,
//     headers: {
//       "Content-Type": "application/json",
//     },
//     json: combinedDnsRecordsJson,
//   });
// }

/**
 * Post the packages to external server for processing to list of Package IDs
 *
 * @param {packageList} [packageList] - Json Response from getAllPackages.
 * @param {cookie} cookie - Cookie for My20i to allow access.
 * @returns {Promise<Object>} Json Response with URl to download Zone File
 */
export async function getZoneFiles(packageList, cookie) {
  const url = "https://dns-exporter.joshuaminer.uk/export_to_zonefile.py";
  return await fetchJson(url, {
    method: "POST",
    compress: false,
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": cookie,
    },
    json: packageList,
  });
}
