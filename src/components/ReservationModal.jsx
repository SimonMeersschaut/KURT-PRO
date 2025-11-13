import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SeatMap from "./SeatMap";
import makeReservation from "../api/reservation";
import { useNotification } from "../context/NotificationContext";

export default function ReservationModal({
  zone,
  date,
  time,
  open,
  onClose,
}) {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const { showNotification } = useNotification();

  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
  };

  const handleReserve = async () => {
    if (!selectedSeat) return;

    // The availability data is inside SeatMap, which is not ideal.
    // For now, I'll have to pass the availability data up from SeatMap
    // or make the reservation from within SeatMap.
    // The user wants the button here, so I need to get the seat data.
    // I will modify SeatMap to pass the selected seat data up.

    // For now, let's assume I can get the seat's availability ID.
    // I'll need to modify SeatMap to expose this.
    // Let's assume onSeatSelect will give me the whole seat object.
    
    try {
      const result = await makeReservation(selectedSeat.id, date, time);

      if (result.success) {
        showNotification(result.message, "success");
        onClose(); // close dialog on success
      } else {
        showNotification(result.message, "error");
      }
    } catch (err) {
      showNotification("Reservation failed: " + err.message, "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Reserve a seat in {zone.name || `Zone ${zone.id}`}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1">Date: {date.toDateString()}</Typography>
        <Typography variant="body1">
          Time: {time.start} - {time.end}
        </Typography>
        <Box mt={2}>
          <SeatMap
            zone={zone}
            startDate={date}
            timeRange={time}
            onSeatClick={handleSeatSelect}
            selectedSeatNr={selectedSeat?.seatNr}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleReserve}
          variant="contained"
          disabled={!selectedSeat}
        >
          Confirm Reservation
        </Button>
      </DialogActions>
    </Dialog>
  );
}
