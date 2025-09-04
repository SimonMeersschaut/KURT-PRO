// client.js
export const kurt3 =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000" // Mock server
    : "https://kurt3.ghum.kuleuven.be"; // Production

export const github =
  "https://corsproxy.io/?https://raw.githubusercontent.com/SimonMeersschaut/KURT-PRO/refs/heads/react-app/";

/**
 * Centralized fetch wrapper
 * @param {string} endpoint - relative path (e.g., "/reservations")
 * @param {object} options - fetch options
 * @param {string} baseUrl - optional, defaults to kurt3
 */
export async function apiFetch(endpoint, options = {}, baseUrl = null) {
  if (baseUrl == null){
    throw new Error("No base url was provided.")
  }
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

export function apiPostFetch(endpoint, bodyData, baseUrl){
  return apiFetch(endpoint, {method: "POST", "body": JSON.stringify(bodyData)}, baseUrl);
}