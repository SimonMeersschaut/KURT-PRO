import { useState, useEffect } from "react";
import ZoneCardLoader from "./ZoneCardLoader";
import ReservationModal from "./ReservationModal";
import ViewReservationModal from "./ViewReservationModal";
import UpcommingReservations from "./UpcommingReservations";
import { Collapse, Button, Box, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getZones } from "../api/zones";
import { fetchReservations } from "../api/reservations"; 

export default function ZonesContainer({ selectedDate, selectedTime }) {
  const locationId = 1;
  const [zoneForModal, setZoneForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservationToView, setReservationToView] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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

  // Function to fetch reservations
  const refreshReservations = () => {
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
  };

  // Fetch upcoming reservations on mount
  useEffect(() => {
    const cleanup = refreshReservations();
    return cleanup;
  }, []);

  const handleReserveClick = (zone) => {
    setZoneForModal(zone);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setZoneForModal(null);
  };

  const handleViewReservationClick = (reservation) => {
    setReservationToView(reservation);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setReservationToView(null);
  };

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
          onClick={handleViewReservationClick}
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
            onReserve={handleReserveClick}
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
                onReserve={handleReserveClick}
                isFavorite={false}
              />
            ))}
        </Box>
      </Collapse>

      {/* Reservation Modal */}
      {zoneForModal && (
        <ReservationModal
          zone={zoneForModal}
          date={selectedDate}
          time={selectedTime}
          open={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* View Reservation Modal */}
      {reservationToView && (
        <ViewReservationModal
          reservationData={reservationToView}
          open={isViewModalOpen}
          onClose={handleCloseViewModal}
          onDeleteSuccess={refreshReservations}
        />
      )}
    </Box>
  );
}