import pako from "pako";

export async function fetchJson(url, options = {}) {
  const { compress, json, ...rest } = options;
  const method = (options.method || "GET").toUpperCase();

  let body;
  let finalUrl = url;
  let headers = {
    ...(options.headers || {}),
  };

  if (json !== undefined) {
    const jsonString = JSON.stringify(json);

    if (compress) {
      const compressed = pako.gzip(jsonString);
      const base64Data = btoa(String.fromCharCode(...compressed));

      if (method === "GET") {
        // Append as query param
        const encoded = encodeURIComponent(base64Data);
        finalUrl += (url.includes("?") ? "&" : "?") + `data=${encoded}`;
      } else {
        // Send as form-encoded POST
        body = new URLSearchParams({ data: base64Data });
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      }
    } else {
      if (method === "GET") {
        const encoded = encodeURIComponent(jsonString);
        finalUrl += (url.includes("?") ? "&" : "?") + `json=${encoded}`;
      } else {
        body = jsonString;
        headers["Content-Type"] = "application/json";
      }
    }
  }

  const response = await fetch(finalUrl, {
    method,
    headers,
    body,
    ...rest,
  });

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export async function withSessionCookie(fn, ...args) {
  const cookie = await new Promise((resolve) => {
    chrome.cookies.get(
      {
        url: "https://my.20i.com",
        name: "PHPSESSID",
      },
      resolve
    );
  });

  if (!cookie || !cookie.value) {
    throw new Error("Session cookie not found");
  }

  // Call your function with all provided args, plus the cookie
  return fn(...args, cookie.value);
}
