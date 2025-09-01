import React from "react";
import { Button, Typography, Container } from "@mui/material";

export default function ReservationPage({ zone, date, onBack }) {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Reserve a seat in {zone.name}
      </Typography>
      <Typography variant="body1">
        Date: {date.toDateString()}
      </Typography>

      <Button
        sx={{ mt: 2 }}
        variant="contained"
        color="primary"
        onClick={() => alert("Reservation submitted (mock)")}
      >
        Confirm Reservation
      </Button>

      <Button sx={{ mt: 2, ml: 2 }} variant="outlined" onClick={onBack}>
        Back
      </Button>
    </Container>
  );
}
