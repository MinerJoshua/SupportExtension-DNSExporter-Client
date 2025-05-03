async function request(url, options = {}) {
    await runLoginCheck();
    const res = await fetch(url, {
      credentials: "include",
      ...options
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }
  
  export function fetchExportItems() {
    return request("https://your-dashboard.com/api/export-options");
  }
  