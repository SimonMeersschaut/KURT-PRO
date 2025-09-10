import { useState } from "react";
import { Typography, Container, IconButton, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, FormControlLabel } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareIcon from "@mui/icons-material/Share";
import SeatMap from "./SeatMap";
import getZoneId from "../api/getZoneId";
import ShareDialog from "./shareReservations";

export default function UpcommingReservation({ reservationData, onBack }) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
  
    let zone_id = getZoneId(reservationData["resourceName"], reservationData["seatNr"]);

    return (
        <Container sx={{ mt: 2 }}>
            {/* Back arrow */}
            <IconButton onClick={onBack} sx={{ mb: 2 }}>
            <ArrowBackIcon />
            </IconButton>

            {/* Share button */}
            <IconButton onClick={handleOpen} sx={{ mb: 2, float: "right" }}>
            <ShareIcon />
            </IconButton>

            {/* Page header */}
            <Typography variant="h5" gutterBottom>
            {reservationData.resourceName}
            </Typography>

            <SeatMap 
                zone={{id: zone_id, name: reservationData["resourceName"]}}
            />

            <ShareDialog isOpen={open} handleClose={() => {handleClose()}}/>
        </Container>
    );
}
