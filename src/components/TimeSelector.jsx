import React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function TimeSelector({ startTime, endTime, onChange }) {
  const hours = Array.from({ length: 17 }, (_, i) => (i + 8).toString().padStart(2, "0") + ":00");
  const startHours = hours.slice(0, 16); // 08:00 to 23:00
  const endHours = hours.slice(1);     // 09:00 to 24:00

  const handleStartChange = (event) => {
    const newStart = event.target.value;
    const newStartHour = parseInt(newStart.split(':')[0], 10);
    const endHour = parseInt(endTime.split(':')[0], 10);

    if (newStartHour >= endHour) {
      let newEndHour = newStartHour + 1;
      if (newEndHour > 24) newEndHour = 24;
      const newEnd = newEndHour.toString().padStart(2, '0') + ':00';
      onChange(newStart, newEnd);
    } else {
      onChange(newStart, endTime);
    }
  };

  const handleEndChange = (event) => {
    const newEnd = event.target.value;
    onChange(startTime, newEnd);
  };

  const filteredEndHours = endHours.filter(h => {
      const startHour = parseInt(startTime.split(':')[0], 10);
      const endHour = parseInt(h.split(':')[0], 10);
      return endHour > startHour;
  });

  return (
    <Box display="flex" gap={1} mt={2} flexWrap="wrap">
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Start</InputLabel>
        <Select value={startTime} label="Start" onChange={handleStartChange}>
          {startHours.map((h) => (
            <MenuItem key={h} value={h}>
              {h}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>End</InputLabel>
        <Select value={endTime} label="End" onChange={handleEndChange}>
          {filteredEndHours.map((h) => (
            <MenuItem key={h} value={h}>
              {h}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}