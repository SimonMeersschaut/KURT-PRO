import React, { useState, useEffect } from "react";
import ZoneCardLoader from "./ZoneCardLoader";
import ReservationPage from "./ReservationPage";
import { Collapse, Button, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getZones } from "../api/zones";

export default function ZonesContainer({ selectedDate, selectedTime }) {
  const locationId = 1;
  const [reservedZone, setReservedZone] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const [allZones, setAllZones] = useState([]);
  const [favoriteZoneIds, setFavoriteZoneIds] = useState([14, 11, 2]); // Default favorites

  // Flatten zones from API
  useEffect(() => {
    async function fetchZones() {
      const locations = await getZones();
      const location = locations.find((loc) => loc.id === locationId);
      if (!location) return;

      const zones = [];
      location.libraries.forEach((library) => {
        library.zones.forEach((zone) => {
          zones.push({ ...zone, libraryName: library.name });
        });
      });
      setAllZones(zones);
    }
    fetchZones();
  }, []);

  const toggleFavorite = (zone) => {
    setFavoriteZoneIds((prev) =>
      prev.includes(zone.id)
        ? prev.filter((id) => id !== zone.id)
        : [...prev, zone.id]
    );
  };

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

  const favoriteZones = allZones.filter((zone) =>
    favoriteZoneIds.includes(zone.id)
  );
  const otherZones = allZones.filter((zone) =>
    !favoriteZoneIds.includes(zone.id)
  );

  return (
    <Box>
      {/* Favorites Section */}
      <h2>Favorites</h2>
      <Box
        display="grid"
        gap="1rem"
        gridTemplateColumns="repeat(3, minmax(200px, 1fr))"
      >
        {favoriteZones.map((zone) => (
          <ZoneCardLoader
            key={zone.id}
            locationId={locationId}
            zoneId={zone.id}
            date={selectedDate}
            time={selectedTime}
            onReserve={(z) => setReservedZone(z)}
            isFavorite={true}
          />
        ))}
      </Box>

      {/* Show More Button */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setShowAll((prev) => !prev)}
          variant="text"
          size="small"
        >
          {showAll ? "Show less" : "Show more"}
        </Button>
      </Box>

      {/* Collapsible All Zones (Vertical List) */}
      <Collapse in={showAll} unmountOnExit>
        <Box display="flex" flexDirection="column" gap="0.5rem" mt={1}>
          {showAll &&
            otherZones.map((zone) => (
              <ZoneCardLoader
                key={zone.id}
                locationId={locationId}
                zoneId={zone.id}
                date={selectedDate}
                time={selectedTime}
                onReserve={(z) => setReservedZone(z)}
                isFavorite={false}
              />
            ))}
        </Box>
      </Collapse>
    </Box>
  );
}
