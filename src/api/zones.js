import { apiFetch } from "./client";

export function getZones() {
  return apiFetch("/zones");
}