import { useState, useEffect } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { fetchReservations } from "../api/reservations";

export default function DaySelector({ onSelect }) {
  const [value, setValue] = useState(0);
  const [reservations, setReservations] = useState([]);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    let isMounted = true;

    fetchReservations(unverifiedData => {
      if (isMounted) {
        setReservations(unverifiedData || []);
      }
    })
      .then(verifiedData => {
        if (isMounted) {
          setReservations(verifiedData || []);
        }
      })
      .catch(err => {
        console.error("Failed to fetch reservations:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    onSelect(days[newValue]);
  };

  const dayHasReservation = (day) => {
    const dayTime = day.getTime();
    return reservations.some(
      (res) => new Date(res.startDate).setHours(0, 0, 0, 0) === dayTime
    );
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
        {days.map((d, i) => {
          const reserved = dayHasReservation(d); // synchronous now
          return (
            <Tab
              key={i}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {d.toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                  })}
                  {reserved && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: reservations.isVerified === false ? "grey.500" : "primary.main",
                      }}
                    />
                  )}
                </Box>
              }
              sx={{
                minWidth: { xs: 0, sm: 80 },
                flex: 1,
                fontSize: { xs: "0.75rem", sm: "0.9rem" },
              }}
            />
          );
        })}
      </Tabs>
    </Box>
  );
}
