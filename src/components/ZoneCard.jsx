import React from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export default function ZoneCard({ zone, onClick, onFavorite, isFavorite }) {
  // Calculate available seats from the availabilities array
  const availableSeats = zone.availabilities?.length || 0;

  return (
    <Card
      sx={{ cursor: "pointer", height: "100%" }}
      onClick={onClick}
      variant="outlined"
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">
              {zone.zone?.name || zone.name}
            </Typography>
            {zone.libraryName && (
              <Typography variant="body2" color="text.secondary">
                {zone.libraryName}
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering card click
              onFavorite?.(zone);
            }}
          >
            {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>
        <Typography
          variant="body2"
          color={availableSeats > 0 ? "success.main" : "error.main"}
          mt={1}
        >
          {availableSeats > 0
            ? `${availableSeats} seats available`
            : "No seats available"}
        </Typography>
      </CardContent>
    </Card>
  );
}
