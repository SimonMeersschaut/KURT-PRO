
/*
Effectively book that seat.
*/
function bookSeat(seatId, selectedDay, startTimeHours, endTimeHours){
    const loader = new Loader(`Booking seat ${seatId}`);


    const startDate = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate());
    const endDate = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate());

    if (endTimeHours == 24){
        // change to the next day
        endTimeHours = 0;
        endDate.setDate(endDate.getDate() + 1);
    }

    tunnel.bookSeat(
        seatId=seatId,
        startDateString=dateToString(startDate),
        endDateString=dateToString(endDate),
        startTimeHours=startTimeHours,
        endTimeHours=endTimeHours
    )
    .then(() => {
        loader.success()
    })
    .catch((error) => {
        loader.stop()
        throw error;
    })
}


// const loader = new Loader("Booking seat");