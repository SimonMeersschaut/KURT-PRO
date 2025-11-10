import { apiFetch, github } from "./client";

export function fetchRectangles(zoneId) {
  return apiFetch(`/resources/maps/zones/${zoneId}/rectangles.json`, {}, github);
}