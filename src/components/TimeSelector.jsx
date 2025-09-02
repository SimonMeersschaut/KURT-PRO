import React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function TimeSelector({ startTime, endTime, onChange }) {
  // Hours from 08:00 to 23:00
  const hours = Array.from({ length: 16 }, (_, i) =>
    (i + 8).toString().padStart(2, "0") + ":00"
  );

  const handleStartChange = (event) => {
    const newStart = event.target.value;
    if (newStart >= endTime) {
      onChange(newStart, newStart); // FIXME + 1 hour
    } else {
      onChange(newStart, endTime);
    }
  };

  const handleEndChange = (event) => {
    const newEnd = event.target.value;
    if (newEnd < startTime) {
      onChange(newEnd, newEnd);
    } else {
      onChange(startTime, newEnd);
    }
  };

  return (
    <Box display="flex" gap={1} mt={2} flexWrap="wrap">
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Start</InputLabel>
        <Select value={startTime} label="Start" onChange={handleStartChange}>
          {hours.map((h) => (
            <MenuItem key={h} value={h}>
              {h}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>End</InputLabel>
        <Select value={endTime} label="End" onChange={handleEndChange}>
          {hours.map((h) => (
            <MenuItem key={h} value={h}>
              {h}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
