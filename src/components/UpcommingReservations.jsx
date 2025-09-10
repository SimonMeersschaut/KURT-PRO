import { Collapse, Button, Box, Typography, Paper, Card } from "@mui/material";

export default function UpcommingReservations({ selectedDate, reservationsForSelectedDate, onClick}) {
    return (
        <Box 
            mb={3}
        >
            <Typography variant="h4" gutterBottom>
            Your Reservations on {selectedDate.toDateString()}
            </Typography>
            <Box
                display="flex"
                flexDirection="column"
                gap={1}
                sx={{ cursor: "pointer", height: "100%" }}
                
            >
                {reservationsForSelectedDate.map((res) => (
                    <Card onClick = {() => {onClick(res)}} variant="outlined">
                        <Paper key={res.id} sx={{ p: 2 }}>
                        <Typography>{res.resourceName}</Typography>
                        <Typography>
                            {res.startTime} - {res.endTime}
                        </Typography>
                        </Paper>
                    </Card>
            ))}
            </Box>
        </Box>
    );
}