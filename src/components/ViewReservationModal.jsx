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
import SeatMap from "./SeatMap";
import getZoneId from "../api/getZoneId";
import ShareDialog from "./shareReservations";

export default function ViewReservationModal({
  reservationData,
  open,
  onClose,
}) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  if (!reservationData) return null;

  const zone_id = getZoneId(
    reservationData["resourceName"],
    reservationData["seatNr"]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {reservationData.resourceName}
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
