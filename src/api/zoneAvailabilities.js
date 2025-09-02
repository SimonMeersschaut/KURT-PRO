import { apiFetch, kurt3 } from "./client";

/** Format a Date object to YYYY-MM-DD */
function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Clamp n between [min,max] */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/** In-memory cache: key = `${locationId}-${resourceTypeId}-${YYYY-MM-DD}` */
const availabilityCache = {};

/**
 * Fetch ALL study-seat availabilities for a day (zoneId = -1 = all zones).
 * Paginates (60/page). Caches per day per location.
 */
async function fetchDailyAvailabilities(locationId, zoneId, resourceTypeId, dateObj) {
  const dateStr = formatDate(dateObj);
  const cacheKey = `${locationId}-${zoneId}-${resourceTypeId}-${dateStr}`;
  if (availabilityCache[cacheKey]) return availabilityCache[cacheKey];

  let page = 0;
  let results = [];

  while (true) {
    const query = new URLSearchParams({
      locationId: String(locationId),
      zoneId: String(zoneId),   // ⬅️ use actual zoneId
      resourceTypeId: String(resourceTypeId),
      pageNumber: String(page),
      startDate: dateStr,
      startTime: "",
      endDate: dateStr,
      endTime: "",
      participantCount: "1",
      tagIds: "",
      exactMatch: "true",
      onlyFavorites: "false",
      resourceNameInfix: "",
      version: "2.0",
    }).toString();

    const resp = await apiFetch(`/api/resourcetypeavailabilities?${query}`, {}, kurt3);
    const items = resp?.availabilities ?? [];
    results = results.concat(items);

    if (items.length === 60) {
      page += 1;
      continue;
    }
    break;
  }

  availabilityCache[cacheKey] = results;
  return results;
}


/** Convert "HH:MM" to slot index where 8:00 => 0, 9:00 => 1, ..., 23:00 => 15 */
function hourToIndex(hhmm) {
  const [h] = hhmm.split(":").map(Number);
  return h - 8; // slotAllocation is 16 chars (8–23)
}

/**
 * Return seats available for the FULL interval [start, end) on the given day.
 */
export async function getZoneAvailabilities(locationId, zoneId, startDate, timeRange) {
  const resourceTypeId = 302; // Study Seat

  // Fetch once (all zones), filter locally.
  const all = await fetchDailyAvailabilities(locationId, zoneId, resourceTypeId, startDate);

  let startIdx = hourToIndex(timeRange.start);
  let endIdx   = hourToIndex(timeRange.end);

  startIdx = clamp(startIdx, 0, 16);
  endIdx   = clamp(endIdx,   0, 16);

  if (endIdx <= startIdx) return { availabilities: [] };

  const filtered = all.filter((seat) => {
    const alloc = seat.slotAllocation;
    if (!alloc || alloc.length !== 16) return false;

    // IMPORTANT: A = available, U = unavailable
    for (let i = startIdx; i < endIdx; i++) {
      if (alloc[i] !== "A") return false;
    }
    return true;
  });

  return {
    availabilities: filtered.map((s) => ({ ...s, available: true })),
  };
}
