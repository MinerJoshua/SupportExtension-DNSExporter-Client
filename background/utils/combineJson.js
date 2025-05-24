/**
 * Combine DNS records from an array of response objects.
 * Skips empty or invalid results.
 *
 * @param {Array} responses - An array of response objects
 * @returns {Object} - Combined DNS records keyed by domain
 */
export function combineDnsResponses(responses) {
  const combined = {};

  for (const response of responses) {
    const result = response?.result;

    // Skip empty arrays or missing/invalid result objects
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      continue;
    }

    for (const domain in result) {
      const recordSet = result[domain];
      if (
        recordSet &&
        Array.isArray(recordSet.records) &&
        recordSet.records.length > 0
      ) {
        combined[domain] = recordSet.records;
      }
    }
  }

  return combined;
}
