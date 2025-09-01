import React from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

export default function ZoneCard({ zone, onClick, onInfo }) {
  // Calculate available seats from the availabilities array
  console.log(zone)
  const availableSeats = zone.availabilities?.length || 0;

  return (
    <Card
      sx={{ cursor: "pointer", height: "100%" }}
      onClick={onClick}
      variant="outlined"
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{zone.zone?.name || zone.name}</Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onInfo?.(zone);
            }}
          >
            <InfoIcon />
          </IconButton>
        </Box>
        <Typography
          variant="body2"
          color={availableSeats > 0 ? "success.main" : "error.main"}
        >
          {availableSeats > 0
            ? `${availableSeats} seats available`
            : "No seats available"}
        </Typography>
      </CardContent>
    </Card>
  );
}
