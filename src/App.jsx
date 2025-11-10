import { useState, useEffect } from "react";
import './App.css';
import { Container, Box, Typography } from "@mui/material";
import DaySelector from "./components/DaySelector";       // your day selector
import ZonesContainer from "./components/ZonesContainer"; // new zones grid
import TimeSelector from "./components/TimeSelector";
import { NotificationProvider } from "./context/NotificationContext";

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState({
    start: "09:00",
    end: "10:00",
  });

  useEffect(() => {
    const today = new Date();
    if (selectedDate.toDateString() === today.toDateString()) {
      const currentHour = today.getHours();
      const startHour = parseInt(selectedTime.start.split(':')[0], 10);

      if (currentHour >= startHour) {
        const nextHour = currentHour + 1;
        if (nextHour < 24) {
          const newStart = nextHour.toString().padStart(2, '0') + ':00';
          const newEnd = (nextHour + 1).toString().padStart(2, '0') + ':00';
          setSelectedTime({ start: newStart, end: newEnd });
        }
      }
    }
  }, [selectedDate]);

  const handleTimeChange = (start, end) => {
    setSelectedTime({ start, end });
  };

  return (
    <NotificationProvider>
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Typography variant="h1" gutterBottom>
          Kurt PRO {process.env.NODE_ENV === "development" ? " Dev" : ""}
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
    </NotificationProvider>
  );
}