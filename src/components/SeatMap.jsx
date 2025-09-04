import { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Alert, Snackbar } from "@mui/material";
import { getZoneAvailabilities } from "../api/zoneAvailabilities";
import { fetchRectangles } from "../api/rectangles";

export default function SeatMap({ zone, startDate, timeRange, onReserve }) {
  const [rectangles, setRectangles] = useState(null);
  const [availabilities, setAvailabilities] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [notification, setNotification] = useState(null); // { type: "success" | "error", message: string }

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
        setNotification({ type: "error", message: "Failed to load seat map." });
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
        setNotification({ type: "error", message: "Failed to fetch seat availability." });
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
        setNotification({ type: "success", message: result.message });
        // Optionally refresh availability or update cache
      } else {
        setNotification({ type: "error", message: result.message });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Reservation failed: " + err.message });
    }
  };

  if (!rectangles) return <Typography>Loading seat map...</Typography>;

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
        const seatNr = /[^ ]*$/.exec(seat.name)[0];
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
              backgroundColor: available
                ? selectedSeat === seatNr
                  ? "rgba(0,0,255,0.6)"
                  : "rgba(0,255,0,0.4)"
                : "rgba(128,128,128,0.4)",
              border: "1px solid black",
              transform: `rotate(${seat.rotation}deg)`,
              transformOrigin: "center",
              cursor: available ? "pointer" : "not-allowed",
            }}
          />
        );
      })}

      {/* Reservation button */}
      {selectedSeat && (
        <Paper
          sx={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            p: 2,
            backgroundColor: "rgba(255,255,255,0.9)",
            maxWidth: 300,
          }}
        >
          <Typography>Selected Seat: {selectedSeat}</Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 1 }}
            onClick={handleReserve}
          >
            Reserve
          </Button>
        </Paper>
      )}

      {/* Notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {notification && (
          <Alert
            severity={notification.type}
            onClose={() => setNotification(null)}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}
