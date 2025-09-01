import { apiFetch } from "./client";

/**
 * Fetch availabilities for a specific zone on a given date/time.
 * 
 * @param {number} locationId - Location ID (e.g., 1)
 * @param {number} zoneId - Zone ID (e.g., 14)
 * @param {string} startDate - Date string in YYYY-MM-DD
 * @param {string} startTime - Time string in HH:mm
 */
export function getZoneAvailabilities(locationId, zoneId, startDate, startTime) {
  const query = `?locationId=${locationId}&zoneId=${zoneId}&startDate=${startDate}&startTime=${startTime}`;
  return apiFetch(`/api/zoneavailabilities${query}`);
}
