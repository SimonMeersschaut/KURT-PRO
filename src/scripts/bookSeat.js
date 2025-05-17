
/*
Effectively book that seat.

TODO: define return types
*/
async function bookSeat(dayIndex, seatNr, seatId, selectedDay, startTimeHours, endTimeHours){
    const loader = new Loader(`Booking seat ${seatId}`);
    const startDate = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate());
    const endDate = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate());

    if (endTimeHours == 24){
        // change to the next day
        endTimeHours = 0;
        endDate.setDate(endDate.getDate() + 1);
    }

    try{
        await tunnel.bookSeat(
            dayIndex=dayIndex,
            seatNr=seatNr,
            seatId=seatId,
            startDateString=dateToString(startDate),
            endDateString=dateToString(endDate),
            startTimeHours=startTimeHours,
            endTimeHours=endTimeHours
        );
        // success
        loader.success()
        return true;
    }
    catch(e){
        loader.stop();
        console.error(e);
        return false;
    }
}