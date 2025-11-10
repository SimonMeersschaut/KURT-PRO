import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import * as htmlToImage from "html-to-image";
import { fetchReservations } from "../api/reservations";
import SeatMap from "./SeatMap";
import getZoneId from "../api/getZoneId";

export default function ShareDialog({ isOpen, handleClose, clickedReservationId }) {
  const [reservations, setReservations] = useState([]);
  const [selectedReservations, setSelectedReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const shareRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setReservations([]);
      setSelectedReservations(clickedReservationId ? [clickedReservationId] : []);

      let isMounted = true;

      fetchReservations(unverifiedData => {
        if (isMounted) {
          setReservations(unverifiedData || []);
          if (!clickedReservationId) {
            setSelectedReservations((unverifiedData || []).map(r => r.id));
          }
        }
      })
        .then(verifiedData => {
          if (isMounted) {
            setReservations(verifiedData || []);
            if (!clickedReservationId) {
              setSelectedReservations((verifiedData || []).map(r => r.id));
            }
          }
        })
        .finally(() => {
            if(isMounted){
                setLoading(false)
            }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, clickedReservationId]);

  const handleToggleReservation = (id) => {
    setSelectedReservations((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedReservations.length === reservations.length) {
      setSelectedReservations([]); // all selected → deselect all
    } else {
      setSelectedReservations(reservations.map((r) => r.id));
    }
  };

  const handleShare = async () => {
    if (!shareRef.current || selectedReservations.length === 0) return;

    try {
      // Convert DOM node to PNG
      const dataUrl = await htmlToImage.toPng(shareRef.current, {
        cacheBust: true,
        style: {
          background: "white", // ensure a white background
        },
        pixelRatio: 2,
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "reservation.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Reservation",
          text: "Here’s my shared reservation.",
        });
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "reservation.png";
        link.click();
      }
    } catch (err) {
      console.error("Image export failed", err);
    }

    handleClose();
  };

  const groupedReservations = reservations.reduce((acc, r) => {
    const date = new Date(r.startDate).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(r);
    return acc;
  }, {});

  // --- Visualization Component ---
  const ReservationPreview = () => {
    const selected = reservations.filter((r) =>
      selectedReservations.includes(r.id)
    );

    if (selected.length === 0) {
      return <Typography color="text.secondary">No reservations selected</Typography>;
    }

    if (selected.length === 1) {
      const r = selected[0];
      const seatNrStr = /[^ ]*$/.exec(r.resourceName)[0];
      const seatNr = parseInt(seatNrStr, 10);
      const zoneId = getZoneId(r.resourceName, seatNr);
      const zone = { id: zoneId, name: '' }; // SeatMap primarily needs the id.
      const startDate = new Date(r.startDate);
      const timeRange = { start: r.startTime, end: r.endTime };

      return (
        <SeatMap
          zone={zone}
          startDate={startDate}
          timeRange={timeRange}
          reservationNr={seatNr}
          onReserve={() => {}} // onReserve is not needed for preview
        />
      );
    }

    return (
      <Paper elevation={2} sx={{ mt: 2}}>
        <Table size="medium" >
          <TableHead>
            <TableRow  >
              <TableCell >Resource</TableCell>
              <TableCell >Date</TableCell>
              <TableCell >Time</TableCell>
              <TableCell >Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selected.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.resourceName}</TableCell>
                <TableCell>{r.startDate}</TableCell>
                <TableCell>
                  {r.startTime} – {r.endTime}
                </TableCell>
                <TableCell>{r.isVerified === false ? 'Unverified' : ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Reservations to Share</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <Box display="flex" flexDirection="column" gap={1}>
            <Button
              onClick={handleToggleAll}
              size="small"
              sx={{ alignSelf: "flex-start" }}
            >
              {selectedReservations.length === reservations.length
                ? "Deselect All"
                : "Select All"}
            </Button>
            {Object.entries(groupedReservations).map(([date, reservationsOnDate]) => (
              <Box key={date} sx={{ mb: 2 }}>
                <Typography variant="h6">{date}</Typography>
                {reservationsOnDate.map((r) => (
                  <FormControlLabel
                    key={r.id}
                    control={
                      <Checkbox
                        checked={selectedReservations.includes(r.id)}
                        onChange={() => handleToggleReservation(r.id)}
                      />
                    }
                    label={r.resourceName}
                  />
                ))}
              </Box>
            ))}

            {/* --- Preview Section (captured by html-to-image) --- */}
            <Box sx={{ p: 2, backgroundColor: "white" }}>
              <Typography variant="h5">Preview</Typography>
              <Card
                    sx={{ cursor: "pointer", height: "100%" }}
                    variant="outlined"
                >
                    <CardContent>
                        <Box ref={shareRef} sx={{ p: 2, backgroundColor: "white" }}>
                            <Typography variant="h3" sx={{mt: 2, textAlign: "center"}}>
                                Library Reservations
                            </Typography>
                            <ReservationPreview/>
                            <Typography variant="body2" color="text.secondary" sx={{mt: 2, textAlign: "right"}}>
                                Made using Kurt-Pro
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleShare}
          variant="contained"
          disabled={selectedReservations.length === 0}
        >
          Share
        </Button>
      </DialogActions>
    </Dialog>
  );
}
