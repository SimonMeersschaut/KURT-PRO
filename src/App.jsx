import { useState } from "react";
import './App.css';
import { Container, Box, Typography } from "@mui/material";
import DaySelector from "./components/DaySelector";       // your day selector
import ZonesContainer from "./components/ZonesContainer"; // new zones grid
import TimeSelector from "./components/TimeSelector";

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState({
    start: "09:00",
    end: "10:00",
  });

  const handleTimeChange = (start, end) => {
    setSelectedTime({ start, end });
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h1" gutterBottom>
        Kurt PRO
      </Typography>

      <DaySelector onSelect={setSelectedDate} />

      <TimeSelector
        startTime={selectedTime.start}
        endTime={selectedTime.end}
        onChange={handleTimeChange}
      />

      <Box mt={2}>
        <ZonesContainer
          selectedDate={selectedDate}
          selectedTime={selectedTime} // pass both start and end
        />
      </Box>
    </Container>
  );
}
