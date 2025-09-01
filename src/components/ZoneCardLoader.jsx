import React, { useEffect, useState } from "react";
import ZoneCard from "./ZoneCard";
import { getZoneAvailabilities } from "../api/zoneAvailabilities";

export default function ZoneCardLoader({ locationId, zoneId, date, time, onReserve }) {
  const [zone, setZone] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getZoneAvailabilities(locationId, zoneId, date, time)
    .then((res) => {
        const availableSeats = res.availabilities?.length ?? 0;
        setZone(res);
    })
      .catch((err) => setError(err.message));
  }, [locationId, zoneId, date, time]);

  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!zone) return <div>Loading zone {zoneId}…</div>;

  return (
    <ZoneCard
      zone={zone}
      onClick={() => onReserve(zone)}
      onInfo={(z) => {
        // Example: open a modal or show floor plan image
        alert(`Map for ${z.name}\nFloor plan: ${z.floorPlan || "none"}`);
      }}
    />
  );
}
