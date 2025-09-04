// import { useState } from "react";
import { Typography, Container, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SeatMap from "./SeatMap";
import makeReservation from "../api/reservation"

export default function ReservationPage({ zone, date, time, onBack }) {
  return (
    <Container sx={{ mt: 2 }}>
      {/* Back arrow at the top */}
      <IconButton onClick={onBack} sx={{ mb: 2 }}>
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h5" gutterBottom>
        Reserve a seat in {zone.name || `Zone ${zone.id}`}
      </Typography>

      <Typography variant="body1">Date: {date.toDateString()}</Typography>
      <Typography variant="body1">
        Time: {time.start} - {time.end}
      </Typography>

      <Typography variant="body1" sx={{ mt: 1 }}>
        Zone: {zone.name || `Zone ${zone.id}`}
      </Typography>

      {/* Seat map */}
      <SeatMap
        zone={zone}
        date={date}
        time={time}
        onReserve = {makeReservation}
      />
    </Container>
  );
}
