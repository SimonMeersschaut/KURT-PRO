import React, { useState, useEffect } from "react";
import ZoneCardLoader from "./ZoneCardLoader";
import ReservationPage from "./ReservationPage";
import ZoneCard from "./ZoneCard"; // Use your updated card with heart button
import { Collapse, Button, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getZones } from "../api/zones";

export default function ZonesContainer({ selectedDate, selectedTime }) {
  const locationId = 1;
  const [reservedZone, setReservedZone] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [allZoneDataLoaded, setAllZoneDataLoaded] = useState(false);

  const [allZones, setAllZones] = useState([]);
  const [favoriteZoneIds, setFavoriteZoneIds] = useState([14, 11, 2]); // Default favorites

  // Flatten zones from API
  useEffect(() => {
    async function fetchZones() {
      const locations = await getZones();
      // Assuming locationId = 1 (Leuven)
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

  useEffect(() => {
    if (showAll && !allZoneDataLoaded) {
      setAllZoneDataLoaded(true);
    }
  }, [showAll, allZoneDataLoaded]);

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

  const favoriteZones = allZones.filter((zone) => favoriteZoneIds.includes(zone.id));
  const otherZones = allZones.filter((zone) => !favoriteZoneIds.includes(zone.id));

  return (
    <Box>
      {/* Favorites Section */}
      <h2>Favorites</h2>
      <Box
        display="grid"
        gap="1rem"
        gridTemplateColumns="repeat(3, minmax(200px, 1fr))" // Max 3 columns
      >
        {favoriteZones.map((zone) => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            onClick={() => setReservedZone(zone)}
            onFavorite={toggleFavorite}
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
      <Collapse in={showAll}>
        <Box display="flex" flexDirection="column" gap="0.5rem" mt={1}>
          {otherZones.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              onClick={() => setReservedZone(zone)}
              onFavorite={toggleFavorite}
              isFavorite={favoriteZoneIds.includes(zone.id)}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
