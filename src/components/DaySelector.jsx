import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";

export default function DaySelector({ onSelect }) {
  const [value, setValue] = useState(0);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
    onSelect(days[newValue]);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", overflowX: "auto" }}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Day selector"
        >
        {days.map((d, i) => (
            <Tab
            key={i}
            label={d.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
            })}
            sx={{
                minWidth: { xs: 0, sm: 80 },   // shrink on extra-small screens
                flex: 1,                       // let them squeeze evenly
                fontSize: { xs: "0.75rem", sm: "0.9rem" }, // smaller text on mobile
            }}
            />
        ))}
        </Tabs>
    </Box>
  );
}
