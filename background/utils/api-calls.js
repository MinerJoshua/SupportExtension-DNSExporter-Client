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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Packages),
  });
}
