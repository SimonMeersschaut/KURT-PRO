import { apiFetch } from "./client";

export function getZones() {
  return apiFetch("https://raw.githubusercontent.com/SimonMeersschaut/KURT-PRO/refs/heads/main/resources/maps/zones/zones.json");
}