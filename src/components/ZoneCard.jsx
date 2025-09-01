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
  return (
    <Card
      sx={{ cursor: "pointer", height: "100%" }}
      onClick={onClick}
      variant="outlined"
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{zone.name}</Typography>
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
          color={zone.available > 0 ? "success.main" : "error.main"}
        >
          {zone.available > 0
            ? `${zone.available} seats available`
            : "No seats available"}
        </Typography>
      </CardContent>
    </Card>
  );
}
