import React, { useEffect, useState } from "react";
import ZoneCard from "./ZoneCard";
import { getZoneAvailabilities } from "../api/zoneAvailabilities";
import {
  Card,
  CardContent,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";

export default function ZoneCardLoader({
  zone,
  locationId,
  date,
  time,
  onReserve,
  isFavorite,
}) {
  const [availabilitiesData, setAvailabilitiesData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setAvailabilitiesData(null);
    setError("");

    getZoneAvailabilities(locationId, zone?.id, date, time)
      .then((res) => {
        setAvailabilitiesData(res);
      })
      .catch((err) => setError(err.message));
  }, [locationId, zone?.id, date, time]);

  if (error) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardContent>
          <Typography color="error">Error: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!availabilitiesData) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100px"
          >
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Loading {zone?.name || `zone ${zone?.id}`}…
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <ZoneCard
      zone={zone}
      availabilitiesData={availabilitiesData}
      onClick={() => onReserve(zone)}
      isFavorite={isFavorite}
    />
  );
}
