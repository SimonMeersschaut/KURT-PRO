import { apiFetch, github } from "./client";

export function getZones() {
  return apiFetch("resources/maps/zones/zones.json", {}, github);
}