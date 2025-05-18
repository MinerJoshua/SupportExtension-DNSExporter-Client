export function combineDnsResponses(...responses) {
  const combined = {};

  for (const response of responses) {
    console.log(response);
    for (const domain in response) {
      const recordSet = response[domain];
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
