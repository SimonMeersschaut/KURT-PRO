import React, { useState } from "react";
import { Container, Box, Typography } from "@mui/material";
import DaySelector from "./components/DaySelector";       // your day selector
import ZonesContainer from "./components/ZonesContainer"; // new zones grid

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("09:00"); // could make dynamic later

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom>
        Seat Reservation
      </Typography>

      {/* Day selector */}
      <DaySelector onSelect={setSelectedDate} />

      <Box mt={2}>
        <ZonesContainer
          selectedDate={selectedDate}
          selectedTime={selectedTime}
        />
      </Box>
    </Container>
  );
}
