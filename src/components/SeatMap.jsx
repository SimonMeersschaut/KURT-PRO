import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { apiFetch } from "../api/client";

export default function SeatMap({ zone, date, time, onSelectSeat, reservationData = null }) {
  const [seatData, setSeatData] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    if (!zone) return;

    const fetchMapData = async () => {
      try {
        const data = await apiFetch(`/api/zones/${zone.zone.id}/map`);
        setSeatData(data);
      } catch (err) {
        console.error("Failed to fetch map data:", err);
      }
    };

    fetchMapData();
  }, [zone, date, time]);

  const handleSeatClick = (seat) => {
    if (!seat.available) return;
    setSelectedSeat(seat.id);
    onSelectSeat?.(seat.id);
  };

  if (!seatData) return <Typography>Loading seat map...</Typography>;

  return (
    <Box
  sx={{
    position: "relative",
    width: "100%",
    // preserve the original aspect ratio of the map
    aspectRatio: `${seatData.image_width} / ${seatData.image_height}`,
    display: "grid",
    gridTemplateColumns: `repeat(${seatData.image_width}, 1fr)`,
    gridTemplateRows: `repeat(${seatData.image_height}, 1fr)`,
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

    {/* Seat rectangles */}
    {Object.values(seatData.seats).map((seat) => (
      <Box
        key={seat.id}
        onClick={() => handleSeatClick(seat)}
        sx={{
          gridColumnStart: seat.x,
          gridColumnEnd: seat.x + seat.width,
          gridRowStart: seat.y,
          gridRowEnd: seat.y + seat.height,
          backgroundColor: seat.available
            ? selectedSeat === seat.id
              ? "blue"
              : "green"
            : "grey",
          transform: `rotate(${seat.rotation}deg)`,
          transformOrigin: "top left",
          cursor: seat.available ? "pointer" : "not-allowed",
          border: "1px solid black",
          zIndex: 1,
        }}
      />
    ))}
  </Box>

  );
}
