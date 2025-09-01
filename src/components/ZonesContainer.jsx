import React, { useState, useEffect } from "react";
import ZoneCardLoader from "./ZoneCardLoader";
import ReservationPage from "./ReservationPage";
import { Collapse, Button, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function ZonesContainer({ selectedDate, selectedTime }) {
  const locationId = 1;

  const favoriteZones = [14, 11, 2];
  const allZones = [14, 11, 2, 5, 6, 7, 8, 9, 10];

  const [reservedZone, setReservedZone] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [allZoneDataLoaded, setAllZoneDataLoaded] = useState(false);

  useEffect(() => {
    if (showAll && !allZoneDataLoaded) {
      setAllZoneDataLoaded(true);
    }
  }, [showAll, allZoneDataLoaded]);

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
    <Box>
      {/* Favorites Section */}
      <h2>Favorites</h2>
      <Box
        display="grid"
        gap="1rem"
        gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
      >
        {favoriteZones.map((zoneId) => (
          <ZoneCardLoader
            key={zoneId}
            locationId={locationId}
            zoneId={zoneId}
            date={selectedDate}
            time={selectedTime}
            onReserve={(zone) => setReservedZone(zone)}
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
        <Box
          display="flex"
          flexDirection="column"
          gap="0.5rem"
          mt={1}
        >
          {allZones.map((zoneId) => (
            <ZoneCardLoader
              key={zoneId}
              locationId={locationId}
              zoneId={zoneId}
              date={selectedDate}
              time={selectedTime}
              onReserve={(zone) => setReservedZone(zone)}
              fetchAvailability={allZoneDataLoaded}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
