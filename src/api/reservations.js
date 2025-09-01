import { apiFetch } from "./client";

export function fetchZones(dayIndex) {
  return apiFetch(`/reservations?day=${dayIndex}`);
}

export function createReservation(zoneId, dayIndex, data) {
  return apiFetch(`/reservations`, {
    method: "POST",
    body: JSON.stringify({ zoneId, dayIndex, ...data }),
  });
}
