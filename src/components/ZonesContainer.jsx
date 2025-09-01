import React, { useState } from "react";
import ZoneCardLoader from "./ZoneCardLoader";
import ReservationPage from "./ReservationPage";

export default function ZonesContainer({ selectedDate, selectedTime }) {
  const locationId = 1; // Hardcoded for now
  const zones = [14, 11, 2]; // Example zone IDs

  const [reservedZone, setReservedZone] = useState(null);

  // If a zone is selected, show the reservation page
  if (reservedZone) {
    return (
      <ReservationPage
        zone={reservedZone}
        date={selectedDate}
        time={selectedTime}
        onBack={() => setReservedZone(null)}
      />
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      }}
    >
      {zones.map((zoneId) => (
        <ZoneCardLoader
          key={zoneId}
          locationId={locationId}
          zoneId={zoneId}
          date={selectedDate}
          time={selectedTime}
          onReserve={(zone) => {
            setReservedZone(zone);
          }}
        />
      ))}
    </div>
  );
}
