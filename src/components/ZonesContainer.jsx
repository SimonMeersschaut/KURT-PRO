import ZoneCardLoader from "./ZoneCardLoader";

export default function ZonesContainer({ selectedDate, selectedTime }) {
  const locationId = 1; // Hardcoded for now
  const zones = [14, 11, 2]; // Example zone IDs

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {zones.map((zoneId) => (
        <ZoneCardLoader
          key={zoneId}
          locationId={locationId}
          zoneId={zoneId}
          date={selectedDate}
          time={selectedTime}
          onReserve={(zone) => {
            console.log("Reserve clicked for", zone);
            // Navigate to reservation page here
          }}
        />
      ))}
    </div>
  );
}
