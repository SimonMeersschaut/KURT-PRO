// Centralized fetch wrapper

const DEBUG = process.env.NODE_ENV === "development";

// Define your possible backends
const BASE_URLS = {
  KULEUVEN: "https://kurt3.ghum.kuleuven.be",
  GITHUB: "https://raw.githubusercontent.com/YourUsername/YourRepo/main", 
  MOCK: "http://localhost:5000", // e.g. json-server
};

// Choose which to use for what
function resolveBaseUrl(endpoint) {
  if (DEBUG) return BASE_URLS.MOCK;

  // Decide based on endpoint
  if (endpoint.startsWith("/reservations")) return BASE_URLS.KULEUVEN;
  if (endpoint.startsWith("/zones")) return BASE_URLS.KULEUVEN;
  if (endpoint.startsWith("/config") || endpoint.startsWith("/settings")) return BASE_URLS.GITHUB;

  throw new Error(`Unknown API endpoint: ${endpoint}`);
}

export async function apiFetch(endpoint, options = {}) {
  const baseUrl = resolveBaseUrl(endpoint);
  const url = `${baseUrl}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let errMsg = `Error ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        errMsg += ` - ${errJson.message || JSON.stringify(errJson)}`;
      } catch (_) {}
      throw new Error(errMsg);
    }

    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    throw err;
  }
}
