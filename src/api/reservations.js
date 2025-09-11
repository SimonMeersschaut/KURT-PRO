import { apiFetch, apiPostFetch, kurt3, kurtpro } from "./client";

let fetchInProgressPromise = null;
let unverifiedDataPromise = null;
let reservationCache = null;
let cacheIsVerified = false;

export function clearReservationCache() {
  fetchInProgressPromise = null;
  unverifiedDataPromise = null;
  reservationCache = null;
  cacheIsVerified = false;
}

export function fetchReservations(onUnverifiedData) {
  if (reservationCache && cacheIsVerified) {
    return Promise.resolve(reservationCache);
  }

  if (!fetchInProgressPromise) {
    // Start fetching if not already in progress.
    
    unverifiedDataPromise = apiFetch(`/api/reservations`, {}, kurtpro)
      .then(data => {
        if (!cacheIsVerified) {
          const unverifiedData = data.map(r => ({...r, isVerified: false}));
          reservationCache = unverifiedData;
          return unverifiedData;
        }
        return null;
      })
      .catch(error => {
        console.error("Failed to fetch from kurtpro", error);
        return null;
      });

    fetchInProgressPromise = apiFetch(`/api/reservations`, {}, kurt3)
      .then(data => {
        const verifiedData = data.map(r => ({...r, isVerified: true}));
        reservationCache = verifiedData;
        cacheIsVerified = true;

        // Sync with the user's backend. Don't wait for it.
        apiPostFetch('/api/sync-reservations', verifiedData, kurtpro)
            .catch(err => console.error("Failed to sync with kurtpro backend", err));

        return verifiedData;
      })
      .catch(err => {
        clearReservationCache();
        throw err;
      });
  }

  if (onUnverifiedData) {
    unverifiedDataPromise.then(unverifiedData => {
      if (unverifiedData && !cacheIsVerified) {
        onUnverifiedData(unverifiedData);
      }
    });
  }

  return fetchInProgressPromise;
}
