import React from "react";
import { Grid } from "@mui/material";
import ZoneCard from "./ZoneCard";

export default function ZoneGrid({ zones, onSelectZone }) {
  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {zones.map((zone) => (
        <Grid item xs={12} sm={6} md={4} key={zone.id}>
          <ZoneCard zone={zone} onClick={() => onSelectZone(zone)} />
        </Grid>
      ))}
    </Grid>
  );
}