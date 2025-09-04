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
          `https://raw.githubusercontent.com/SimonMeersschaut/KURT-PRO/refs/heads/main/resources/maps/zones/${zone.id}/rectangles.json`
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
        const availabilityData = (await getZoneAvailabilities(
          1, // locationId
          zone.id,
          startDate,
          time.start
        ))["availabilities"];

        // Transform availability into { seatId: true/false }
        const availabilityMap = {};
        availabilityData.forEach((seat) => {
          const startHour = parseInt(time.start.split(":")[0], 10);
          const endHour = parseInt(time.end.split(":")[0], 10);
          const startIndex = startHour - seat.startSlotAllocation;
          const endIndex = endHour - seat.startSlotAllocation;

          const available =
            startIndex >= 0 &&
            endIndex <= seat.slotAllocation.length &&
            [...seat.slotAllocation].slice(startIndex, endIndex).every(c => c === "A");

          availabilityMap[seat.id] = available;
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
      {seatMap.seats.map((seat) => {
        const available = availabilities[seat.id] ?? false;
        return (
          <Box
            key={seat.id}
            onClick={() => handleSeatClick(seat)}
            sx={{
              position: "absolute",
              left: `${(seat.x / seatMap.image_width) * 100}%`,
              top: `${(seat.y / seatMap.image_height) * 100}%`,
              width: `${(seat.width / seatMap.image_width) * 100}%`,
              height: `${(seat.height / seatMap.image_height) * 100}%`,
              backgroundColor: available
                ? selectedSeat === seat.id
                  ? "rgba(0,0,255,0.6)" // selected = blue
                  : "rgba(0,255,0,0.4)" // available = green
                : "rgba(128,128,128,0.4)", // unavailable = grey
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
    </Box>
  );
}
