import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { getZoneAvailabilities } from "../api/zoneAvailabilities";

export default function SeatMap({ zone, date, time, onReserve }) {
  const [seatMap, setSeatMap] = useState(null);
  const [availabilities, setAvailabilities] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);

  // Fetch static map once per zone
  useEffect(() => {
    if (!zone) return;

    const fetchMap = async () => {
      try {
        const mapData = await fetch(
          `https://raw.githubusercontent.com/SimonMeersschaut/KURT-PRO/refs/heads/main/resources/maps/zones/${zone.zone.id}/rectangles.json`
        ).then((res) => res.json());
        setSeatMap(mapData);
      } catch (err) {
        console.error("Failed to fetch map data:", err);
      }
    };

    fetchMap();
  }, [zone]);

  // Fetch availability when date/time changes
  useEffect(() => {
    if (!zone || !date || !time) return;

    const fetchAvailability = async () => {
      try {
        const startDate = date.toISOString().split("T")[0];
        const availabilityData = await getZoneAvailabilities(
          1, // hardcoded locationId
          zone.zone.id,
          startDate,
          time.start
        );
        // Transform availability data into { seatId: true/false }
        const availabilityMap = {};
        availabilityData.forEach((seat) => {
          availabilityMap[seat.id] = seat.available;
        });
        setAvailabilities(availabilityMap);
        setSelectedSeat(null);
      } catch (err) {
        console.error("Failed to fetch seat availability:", err);
      }
    };

    fetchAvailability();
  }, [zone, date, time]);

  const handleSeatClick = (seat) => {
    if (!availabilities[seat.id]) return;
    setSelectedSeat(seat.id);
  };

  const handleReserve = () => {
    if (!selectedSeat) return;
    onReserve(selectedSeat);
  };

  if (!seatMap) return <Typography>Loading seat map...</Typography>;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: `${seatMap.image_width} / ${seatMap.image_height}`,
        display: "grid",
        gridTemplateColumns: `repeat(${seatMap.image_width}, 1fr)`,
        gridTemplateRows: `repeat(${seatMap.image_height}, 1fr)`,
      }}
    >
      {/* Map image */}
      <Box
        component="img"
        src={`https://raw.githubusercontent.com/SimonMeersschaut/KURT-PRO/main/resources/maps/zones/${zone.zone.id}/map.png`}
        alt={zone.name}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          zIndex: 0,
        }}
      />

      {/* Seats */}
      {Object.values(seatMap.seats).map((seat) => {
        const available = availabilities[seat.id] ?? false;
        return (
          <Box
            key={seat.id}
            onClick={() => handleSeatClick(seat)}
            sx={{
              gridColumnStart: seat.x,
              gridColumnEnd: seat.x + seat.width,
              gridRowStart: seat.y,
              gridRowEnd: seat.y + seat.height,
              backgroundColor: available
                ? selectedSeat === seat.id
                  ? "blue"
                  : "green"
                : "grey",
              transform: `rotate(${seat.rotation}deg)`,
              transformOrigin: "top left",
              cursor: available ? "pointer" : "not-allowed",
              border: "1px solid black",
              zIndex: 1,
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
            zIndex: 2,
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
    </Box>
  );
}
