import { apiFetch, kurt3 } from "./client";

// Cache can store either data or a Promise
let reservationCache = null;

/**
 * Fetch reservations with caching
 * Multiple simultaneous calls will share the same request
 */
export function fetchReservations() {
  if (reservationCache) {
    // If it's a promise or resolved data, return it
    return reservationCache instanceof Promise
      ? reservationCache
      : Promise.resolve(reservationCache);
  }

  // Start the fetch and store the promise immediately
  reservationCache = apiFetch(`/api/reservations`, {}, kurt3)
    .then((data) => {
      reservationCache = data; // replace promise with actual data after resolution
      return data;
    })
    .catch((err) => {
      reservationCache = null; // reset on error so future calls can retry
      throw err;
    });

  return reservationCache;
}
