import { apiFetch, kurt3 } from "./client";

function formatDate(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Fetch availabilities for a specific zone on a given date/time.
 * 
 * @param {number} locationId - Location ID (e.g., 1)
 * @param {number} zoneId - Zone ID (e.g., 14)
 * @param {string} startDate - Date string in YYYY-MM-DD
 * @param {string} startTime - Time string in HH:mm
 */
export async function getZoneAvailabilities(locationId, zoneId, startDate, startTime) {
    const query = `?locationId=${locationId}&zoneId=${zoneId}&startDate=${formatDate(startDate)}&startTime=${startTime["start"]}`;
    return await apiFetch(`/api/zoneavailabilities${query}`, {}, kurt3);
}