import { useEffect, useState } from "react";
import { Box, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar } from "@mui/material";
import { getZoneAvailabilities } from "../api/zoneAvailabilities";
import { fetchRectangles } from "../api/rectangles";
import { getAvatar } from "../api/authentication";
import { useNotification } from "../context/NotificationContext";


export default function SeatMap({ zone, startDate, timeRange, onReserve, reservationNr}) {
  
  const [rectangles, setRectangles] = useState(null);
  const [availabilities, setAvailabilities] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(reservationNr);
  const { showNotification } = useNotification();
  
  
  // Fetch static map once per zone
  useEffect(() => {
    if (!zone) return;
    const fetchMap = async () => {
      try {
        const rectangleData = await fetchRectangles(zone.id);
        if (!rectangleData) throw new Error("No mapData found.");
        setRectangles(rectangleData);
      } catch (err) {
        console.error("Failed to fetch map data:", err);
        showNotification("Failed to load seat map.", "error");
      }
    };
    fetchMap();
  }, [zone]);

  // Fetch availability when date/time changes
  useEffect(() => {
    if (!zone || !startDate || !timeRange) return;

    const fetchAvailability = async () => {
      try {
        const availabilityData = (await getZoneAvailabilities(
          1, // locationId
          zone.id,
          startDate,
          timeRange
        ))["availabilities"];

        const availabilityMap = {};
        availabilityData.forEach((seat) => {
          const seatNr = seat?.seatNr ?? /[^ ]*$/.exec(seat.name)[0];
          availabilityMap[seatNr] = seat;
        });
        setAvailabilities(availabilityMap);
        setSelectedSeat(null);
      } catch (err) {
        console.error("Failed to fetch seat availability:", err);
        showNotification("Failed to fetch seat availability.", "error");
      }
    };
    fetchAvailability();
  }, [zone, startDate, timeRange]);

  const handleSeatClick = (seatNr) => {
    setSelectedSeat(seatNr);
  };

  const handleReserve = async () => {
    if (!selectedSeat) return;
    const seat = availabilities[selectedSeat];

    try {
      const result = await onReserve(seat.id, startDate, timeRange);

      if (result.success) {
        showNotification(result.message, "success");
        setSelectedSeat(null); // close dialog on success
        // Optionally refresh availability or update cache
      } else {
        showNotification(result.message, "error");
      }
    } catch (err) {
      showNotification("Reservation failed: " + err.message, "error");
    }
  };

  if (!rectangles) return <Typography>Loading seat map...</Typography>;

  // Determine if reservation exists on map
  const mySeatOnMap = reservationNr
    ? rectangles?.seats.find(
        (seat) => (seat.seatNr) === reservationNr
      )
    : null;

  if (reservationNr && !mySeatOnMap) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your reservation (#{reservationNr}) was not found on the map.
        </Alert>
        <Typography>
          We are sorry for the inconvenience.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: `${rectangles.image_width} / ${rectangles.image_height}`,
      }}
    >
      {/* Map image */}
      <Box
        component="img"
        src={`https://raw.githubusercontent.com/SimonMeersschaut/KURT-PRO/main/resources/maps/zones/${zone.id}/map.png`}
        alt={zone.name}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {/* Seat overlays */}
      {rectangles.seats.map((seat) => {
        const available = seat.seatNr in availabilities;
        const seatNr = seat.seatNr;

        const isMySeat = reservationNr && reservationNr === seatNr;

        return (
          <Box
            key={seat.id || seat.seatNr}
            onClick={() => handleSeatClick(seatNr)}
            sx={{
              position: "absolute",
              left: `${(seat.x / rectangles.image_width) * 100}%`,
              top: `${(seat.y / rectangles.image_height) * 100}%`,
              width: `${(seat.width / rectangles.image_width) * 100}%`,
              height: `${(seat.height / rectangles.image_height) * 100}%`,
              transform: `rotate(${seat.rotation}deg)`,
              transformOrigin: "center",
              cursor: available ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: isMySeat ? 2: 1
            }}
          >
            {isMySeat ? (
              getAvatar()
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: available
                    ? selectedSeat === seatNr
                      ? "rgba(0,0,255,0.6)"
                      : "rgba(0,255,0,0.4)"
                    : "rgba(128,128,128,0.4)",
                  border: "1px solid black",
                }}
              />
            )}
          </Box>
        );
      })}

      {/* Seat details / Confirm dialog */}
      {selectedSeat && (
        (() => {
          const seatData = availabilities[selectedSeat] ?? null;
          const seatOnMap = rectangles.seats.find((s) => s.seatNr === selectedSeat) ?? null;
          return (
            <Dialog
              open={Boolean(selectedSeat)}
              onClose={() => setSelectedSeat(null)}
              fullWidth
              maxWidth="xs"
            >
              <DialogTitle>Seat {selectedSeat}</DialogTitle>
              <DialogContent dividers>
                {seatOnMap && (
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
                    <Avatar>{String(selectedSeat).slice(0,2)}</Avatar>
                    <Box>
                      <Typography variant="subtitle1">{seatOnMap.name ?? `Seat ${selectedSeat}`}</Typography>
                      <Typography variant="body2" color="text.secondary">Zone: {zone.name}</Typography>
                    </Box>
                  </Box>
                )}
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Date: {startDate instanceof Date ? startDate.toLocaleDateString() : startDate}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Time range: {typeof timeRange === 'object' ? `${timeRange.start} - ${timeRange.end}` : timeRange}
                </Typography>
                <Typography variant="body2">
                  {seatData
                    ? `Status: ${seatData?.status ?? "Available"}`
                    : "No availability details (seat may be unavailable)."}
                </Typography>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setSelectedSeat(null)} variant="outlined">
                  Cancel
                </Button>
                <Button
                  onClick={handleReserve}
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!seatData}
                >
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
          );
        })()
      )}
    </Box>
  );
}