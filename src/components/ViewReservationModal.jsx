import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Container,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SeatMap from "./SeatMap";
import getZoneId from "../api/getZoneId";
import ShareDialog from "./shareReservations";
import { apiFetch, kurt3 } from "../api/client";

export default function ViewReservationModal({
  reservationData,
  open,
  onClose,
  onDeleteSuccess,
}) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  if (!reservationData) return null;

  const zone_id = getZoneId(
    reservationData["resourceName"],
    reservationData["seatNr"]
  );

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this reservation?")) {
      try {
        await apiFetch(`/api/reservations/${reservationData.id}/`, { method: 'DELETE' }, kurt3);
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
        onClose();
      } catch (error) {
        console.error("Failed to delete reservation:", error);
        // Optionally, show an error message to the user
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {reservationData.resourceName}
        <IconButton
          aria-label="edit"
          onClick={() => {
            window.location.href = `/edit-reservation/${reservationData.id}`;
          }}
          sx={{
            position: "absolute",
            right: 120,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label="delete"
          onClick={handleDelete}
          sx={{
            position: "absolute",
            right: 80,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <DeleteIcon />
        </IconButton>

        <IconButton
          aria-label="share"
          onClick={() => setShareDialogOpen(true)}
          sx={{
            position: "absolute",
            right: 40,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <ShareIcon />
        </IconButton>
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
        <Box sx={{ maxWidth: '600px', margin: 'auto' }}>
          <SeatMap
            zone={{ id: zone_id, name: reservationData["resourceName"] }}
            reservationNr={parseInt(reservationData["resourceName"].split(" ").pop())}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      <ShareDialog
        isOpen={shareDialogOpen}
        handleClose={() => setShareDialogOpen(false)}
        clickedReservationId={reservationData.id}
      />
    </Dialog>
  );
}
