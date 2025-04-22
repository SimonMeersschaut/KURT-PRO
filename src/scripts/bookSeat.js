
/*
Effectively book that seat.
*/
function bookSeat(seatId, selectedDay, startTimeHours, endTimeHours){
    const loader = new Loader(`Booking seat ${seatId}`);

    console.log(selectedDay);
    tunnel.bookSeat(
        seatId=seatId,
        dateString=dateToString(selectedDay),
        startTimeHours=startTimeHours,
        endTimeHours=endTimeHours
    )
    .then((success, msg) => {
        if (success)
            loader.success()

            
            // TODO: display new map
        else{
            // NO SUCCESS
            alert(msg);
        }
    })
}


// const loader = new Loader("Booking seat");