import React, { useState } from "react";
import { Container, Box, Typography } from "@mui/material";
import DaySelector from "./components/DaySelector";       // your day selector
import ZonesContainer from "./components/ZonesContainer"; // new zones grid
import TimeSelector from "./components/TimeSelector";

import { messaging, getToken, onMessage } from './firebase';

export async function requestPermissionAndGetToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: "BFrxmtu6qqftQk4ooV9IfMOjoAeWJcBkwAil1kOgrTpOh-Sqb1TGu5YkiWdJIXG-l6QymxP4lPlJ_ji0EjwhTfY" });
      console.log("FCM Token:", token);
      return token;
    } else {
      console.log("Notification permission denied");
    }
  } catch (err) {
    console.error("FCM Error:", err);
  }
}

// Listen for foreground messages
onMessage(messaging, (payload) => {
  console.log("Message received in foreground: ", payload);
  alert(`${payload.notification.title}: ${payload.notification.body}`);
});

requestPermissionAndGetToken()

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
      <Typography variant="h4" gutterBottom>
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
