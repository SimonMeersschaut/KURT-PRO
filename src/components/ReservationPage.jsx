import { Typography, Container, IconButton, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SeatMap from "./SeatMap";
import makeReservation from "../api/reservation";

export default function ReservationPage({ zone, date, time, onBack }) {
  return (
    <Container sx={{ mt: 2 }}>
      {/* Back arrow */}
      <IconButton onClick={onBack} sx={{ mb: 2 }}>
        <ArrowBackIcon />
      </IconButton>

      {/* Page header */}
      <Typography variant="h5" gutterBottom>
        Reserve a seat in {zone.name || `Zone ${zone.id}`}
      </Typography>

      <Typography variant="body1">Date: {date.toDateString()}</Typography>

      <Typography variant="body1">
        Time: {time.start} - {time.end}
      </Typography>

      <Typography variant="body1">
        Zone: {zone.name || `Zone ${zone.id}`}
      </Typography>

      {/* Seat map with details panel */}
      <SeatMap
        zone={zone}
        startDate={date}
        timeRange={time}
        onReserve={makeReservation}
      />
    </Container>
  );
}
