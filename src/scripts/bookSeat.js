
/*
Effectively book that seat.
*/
function bookSeat(seatId){
    const loader = new Loader(`Booking seat ${seatId}`);
    alert(`Booking seat ${seatId}`);
    setTimeout(() => {}, 1000);

    tunnel.bookSeat(
        seatId,
        
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