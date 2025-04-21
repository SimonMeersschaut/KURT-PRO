
/*
Effectively book that seat.
*/
function bookSeat(seatId, selectedDay){
    const loader = new Loader(`Booking seat ${seatId}`);
    setTimeout(() => {}, 1000);

    tunnel.bookSeat(
        seatId=seatId,
        dateString=dateToString(selectedDay),
        startTimeString=settings.getStartTimeString(),
        endTimeString=settings.getEndTimeString()
    )
    .then((success, msg) => {
        if (success)
            loader.success()
        else{
            // NO SUCCESS
            alert(msg);
        }
    })
}


// const loader = new Loader("Booking seat");