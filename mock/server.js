import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { apiFetch } from "../api/client";

export default function SeatMap({ zone, date, time, onReserve }) {
  const [seatMap, setSeatMap] = useState(null); // the static map
  const [availabilities, setAvailabilities] = useState({}); // availability per seat
  const [selectedSeat, setSelectedSeat] = useState(null);

  // 1️⃣ Fetch the static map once per zone
  useEffect(() => {
    if (!zone) return;

    const fetchMap = async () => {
      try {
        const mapData = await apiFetch(`/api/zones/${zone.zone.id}/map`);
        setSeatMap(mapData);
      } catch (err) {
        console.error("Failed to fetch map data:", err);
      }
    };

    fetchMap();
  }, [zone]);

  // 2️⃣ Fetch seat availability when date or time changes
  useEffect(() => {
    if (!zone || !date || !time) return;

    const fetchAvailability = async () => {
      try {
        const availabilityData = await apiFetch(
          `/api/zones/${zone.zone.id}/availability?date=${date.toISOString().split("T")[0]}&start=${time.start}&end=${time.end}`
        );
        // Expected response: { seatId: true/false, ... }
        setAvailabilities(availabilityData);
        setSelectedSeat(null); // reset selection when time changes
      } catch (err) {
        console.error("Failed to fetch seat availability:", err);
      }
    };

    fetchAvailability();
  }, [zone, date, time]);

  const handleSeatClick = (seat) => {
    if (!availabilities[seat.id]) return; // only click free seats
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
      {/* Background map */}
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
