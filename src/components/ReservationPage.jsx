import React, { useState } from "react";
import { Button, Typography, Container } from "@mui/material";
import SeatMap from "./SeatMap";

export default function ReservationPage({ zone, date, time, onBack }) {
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [reservation, setReservation] = useState(null); // mock reservation data if needed

  const handleSelectSeat = (seatId) => {
    setSelectedSeatId(seatId);
  };

  const handleConfirmReservation = () => {
    if (!selectedSeatId) {
      alert("Please select a seat first!");
      return;
    }
    // Here you would call your booking API
    alert(`Reservation submitted for seat ${selectedSeatId} (mock)`);
    // Update reservation state if you want to show reservation card
    setReservation({
      seatNr: selectedSeatId,
      startTime: time.start,
      endTime: time.end,
      onChange: () => alert("Change reservation clicked (mock)"),
      onCancel: () => alert("Cancel reservation clicked (mock)"),
    });
  };

  return (
    <Container sx={{ mt: 4 }}>
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
        onSelectSeat={handleSelectSeat}
        reservationData={reservation}
      />

      {/* Action buttons */}
      {!reservation && (
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          color="primary"
          onClick={handleConfirmReservation}
        >
          Confirm Reservation
        </Button>
      )}

      <Button sx={{ mt: 2, ml: 2 }} variant="outlined" onClick={onBack}>
        Back
      </Button>
    </Container>
  );
}
