import { useState, useEffect } from "react";
import ZoneCardLoader from "./ZoneCardLoader";
import ReservationPage from "./ReservationPage";
import UpcommingReservations from "./UpcommingReservations";
import UpcommingReservation from "./UpcommingReservation";
import { Collapse, Button, Box, Typography, Paper } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getZones } from "../api/zones";
import { fetchReservations } from "../api/reservations"; // <-- assumed

export default function ZonesContainer({ selectedDate, selectedTime }) {
  const locationId = 1;
  const [reservedZone, setReservedZone] = useState(null);
  const [showMapReservation, setShowMapReservation] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [allZones, setAllZones] = useState([]);
  const [favoriteZoneIds, setFavoriteZoneIds] = useState([14, 11, 2]);
  const [upcomingReservations, setUpcomingReservations] = useState([]);

  // Fetch zones
  useEffect(() => {
    let isMounted = true;
    async function fetchZones() {
      const locations = await getZones();
      if (!isMounted) return;
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
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch upcoming reservations
  useEffect(() => {
    let isMounted = true;

    fetchReservations(unverifiedData => {
      if (isMounted) {
        setUpcomingReservations(unverifiedData || []);
      }
    })
      .then(verifiedData => {
        if (isMounted) {
          setUpcomingReservations(verifiedData || []);
        }
      })
      .catch(err => {
        console.error("Failed to fetch upcoming reservations:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setShowMapReservation(null);
  }, [selectedDate]);

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

  if (showMapReservation) {
    return (
      <UpcommingReservation
          reservationData={showMapReservation}
          onBack={() => setShowMapReservation(null)}
      />
    );
  }

  const favoriteZones = allZones.filter((zone) =>
    favoriteZoneIds.includes(zone.id)
  );
  const otherZones = allZones.filter((zone) =>
    !favoriteZoneIds.includes(zone.id)
  );

  // Filter reservations for the selected date
  const reservationsForSelectedDate = upcomingReservations.filter(
    (res) =>
      new Date(res.startDate).setHours(0, 0, 0, 0) ===
      selectedDate.setHours(0, 0, 0, 0)
  );

  return (
    <Box>
      {/* Upcoming Reservations for selected date */}
      {reservationsForSelectedDate.length > 0 && (
        <UpcommingReservations 
          selectedDate={selectedDate}
          reservationsForSelectedDate={reservationsForSelectedDate}
          onClick = {(reservation) => setShowMapReservation(reservation)}
        />
      )}

      {/* Favorites Section */}
      <Typography variant="h4" gutterBottom>
        Favorites
      </Typography>
      <Box
        display="grid"
        gap="1rem"
        gridTemplateColumns="repeat(3, minmax(200px, 1fr))"
      >
        {favoriteZones.map((zone) => (
          <ZoneCardLoader
            key={zone.id}
            zone={zone}
            locationId={locationId}
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

      {/* Collapsible All Zones */}
      <Collapse in={showAll} unmountOnExit>
        <Box display="flex" flexDirection="column" gap="0.5rem" mt={1}>
          {showAll &&
            otherZones.map((zone) => (
              <ZoneCardLoader
                key={zone.id}
                zone={zone}
                locationId={locationId}
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