import { apiFetch, kurt3 } from "./client";

export function fetchZones(dayIndex) {
  return apiFetch(`/reservations?day=${dayIndex}`, {}, kurt3);
}