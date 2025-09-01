import React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function TimeSelector({ startTime, endTime, onChange }) {
  // Hours available for reservation
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0") + ":00"
  );

  const handleStartChange = (event) => {
    const newStart = event.target.value;
    // Ensure start is before end
    if (newStart > endTime) {
      onChange(newStart, newStart);
    } else {
      onChange(newStart, endTime);
    }
  };

  const handleEndChange = (event) => {
    const newEnd = event.target.value;
    // Ensure end is after start
    if (newEnd < startTime) {
      onChange(newEnd, newEnd);
    } else {
      onChange(startTime, newEnd);
    }
  };

  return (
    <Box display="flex" gap={2} mt={2}>
      <FormControl fullWidth>
        <InputLabel>Start Hour</InputLabel>
        <Select value={startTime} label="Start Hour" onChange={handleStartChange}>
          {hours.map((h) => (
            <MenuItem key={h} value={h}>
              {h}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>End Hour</InputLabel>
        <Select value={endTime} label="End Hour" onChange={handleEndChange}>
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
