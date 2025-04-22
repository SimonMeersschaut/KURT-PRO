/*
TODO: docs
*/
function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

/*
Each instance of this class represents a tunnel, an interface between the back-end and the front-end.
Note that this tunnel will perform some cacheing to minimize the amount of requests sent.
*/
class Tunnel{
    constructor (){
        this.dayCaches = [new DayCache(), new DayCache(), new DayCache(), new DayCache(), new DayCache(), new DayCache(), new DayCache(), new DayCache()];
        this.reservationCache = null;
    }

    /*
    This function will return the favorite zones of this user in order.
    */
    getFavoriteZones(){
        return [
            {"location": 10, "id": 2, "name": "Agora - Silent study 2"},
            {"location": 1, "id": 14, "name": "Agora - De zolder"},
            {"location": 1, "id": 11, "name": "Agora - De boekenzaal"},
        ]
    }

    /*
    TODO: docs
    */
    async getReservedDays() {
        var data;
        if (this.reservationCache == null){
            const response = await fetch("https://kurt3.ghum.kuleuven.be/api/reservations");
            data = await response.json();
            this.reservationCache = data;
        }
        else{
            data = this.reservationCache;
        }

        try {
            const output = [null, null, null, null, null, null, null, null];
            const d = new Date();

            data.forEach(reservation => {
                const date = new Date(reservation["startDate"]);
                const dayIndex = dateDiffInDays(d, date);
                if (dayIndex >= 0 && dayIndex <= 7) {
                    let seatNr = parseInt(reservation["resourceName"].split(" ")[reservation["resourceName"].split(" ").length - 1]);
                    output[dayIndex] = seatNr;
                }
            });
            return output;
        } catch (error) {
            console.error("Error fetching reserved days:", error);
            return [null, null, null, null, null, null, null, null];
        }
    }

    /*
    TODO: docs
    */
    async fetchMapData(zoneId){
        try {
            const response = await fetch(`https://raw.githubusercontent.com/SimonMeersschaut/KURT-PRO/refs/heads/Maps/resources/maps/zones/${zoneId}/compression.json`);
            const data = await response.json();
            return data;
        }
        catch(error){
            console.error("Error fetching reserved days:", error);
            throw error;
        }
    }

    /*
    TODO: docs
    */
    async hasReservationOn(dayIndex){
        const reservedDays = await this.getReservedDays();
        return reservedDays[dayIndex];
        // return true;
    }

    /*
    TODO: docs
    */
    async *getAvailableSeats(locationId, zoneId, selectedDay){
        const dayIndex = calculateDayIndex(selectedDay);
        const zoneCache = this.dayCaches[dayIndex].getZoneCache(zoneId);
        if (zoneCache == undefined) 
            throw new Error("`zoneCache` cannot be `null`.");
        if (zoneCache.isValid()){
            yield zoneCache.content;
        }
        else{
            // fetch
            const dateString = dateToString(selectedDay);
            let seatsOnPage = 0;
            let page = 0;
            try {
                do {
                    if (page >= 10)
                        throw new Error("Tried to fetch pages more than 10 times.");
                    const response = await fetch(
                        `https://kurt3.ghum.kuleuven.be/api/resourcetypeavailabilities?locationId=${locationId}&zoneId=${zoneId}&resourceTypeId=302&pageNumber=${page}&startDate=${dateString}&startTime=10:00&endDate=${dateString}&endTime=18:00&participantCount=1&tagIds=&exactMatch=true&onlyFavorites=false&resourceNameInfix=&version=2.0`
                    );
                    const availableSeats = (await response.json())['availabilities'];
                    seatsOnPage = await availableSeats.length;
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    yield availableSeats;
                    // add all availableSeats to the cache
                    availableSeats.forEach(seat => {
                        zoneCache.content.push(seat);
                    })
                    page++;
                } while (seatsOnPage > 0 && seatsOnPage == 60);
            } catch (error) {
                console.error("Error fetching available seats:", error);
            }
            // updated entire cache
            zoneCache.setValid();
        }
    }

    /*
    Get the number of available seats on this day.
    The function fetches the backend page by page and will yield the intermediate results.
    Hence, the backend sends the seats in pages of 60 seats, so we have to calculate the cummulative sum.
    We assume that there are no more than 10 pages and use this to avoid infinite loops.
    */
    async *getAvailableSeatsNumber(locationId, zoneId, selectedDay) {
        var cummulativeSum = 0;

        const seatGenerator = tunnel.getAvailableSeats(locationId, zoneId, selectedDay);
        for await (const availableSeats of seatGenerator) {
            cummulativeSum += availableSeats.length;
            yield cummulativeSum; // Yield the number of seats on the current page
        }
    }

    /*
    TODO: docs
    */
    async *freeSeats(locationId, zoneId, selectedDay){
        const seatGenerator = tunnel.getAvailableSeats(locationId, zoneId, selectedDay);
        for await (const availableSeats of seatGenerator) {
            // avaiableSeats is a list of dictionaries
            for await (const availableSeat of availableSeats){
                // availableSeat: {"name": "Agora - Silent Study Seat 236", ...}
                // splits the name "... Seat 236" -> 236
                let seatNr = await parseInt(availableSeat["name"].split(" ")[availableSeat["name"].split(" ").length - 1]);
                let seatId = await parseInt(availableSeat["id"]);
                try{
                    yield {"seatNr":seatNr, "seatId":seatId};
                }
                catch(error){
                    console.error(error);
                }
            }
        }
    }

    /*
    Sends a request to the back-end to make a reservation.

    URL: https://kurt3.ghum.kuleuven.be/api/reservations/
    PAYLOAD: 
        {
            "id":301783,
            "resourceName":"CBA - Boekenzaal Seat 137",
            "subject":"CBA - Boekenzaal Seat 137",
            "purpose":"",
            "resourceId":301783,
            "startDate":"2025-04-22",
            "startTime":"9:00",
            "endDate":"2025-04-22",
            "endTime":"10:00",
            "participants":[{"uid":"R1039801","email":"simon.meersschaut@student.kuleuven.be"}],
            "summary":["Resource **CBA - Boekenzaal Seat 137**","at **2Bergen Arenberg**","for **simon.meersschaut&commat;student.kuleuven.be**","from **Tue Apr 22 9:00** until **Tue Apr 22 10:00**"],
            "withCheckIn":false
        }
    EXPECTED MESSAGE: "Your reservation has been created. You will receive an e-mail confirmation. The following attendees were validated: R1039801;. (Do not forget to log off on public computers.)"
    */
    async bookSeat(seatId, dateString, startTimeHours, endTimeHours) {
        const EXPECTED_RESPONSE = "Your reservation has been created. You will receive an e-mail confirmation. The following attendees were validated: R1039801;. (Do not forget to log off on public computers.)";

        const bodyData = {
            "id": seatId,
            "resourceName": "", // original "CBA - Boekenzaal Seat 137"
            "subject": "", // original: "CBA - Boekenzaal Seat 137"
            "purpose": "",
            "resourceId": seatId,
            "startDate": dateString,
            "startTime": `${startTimeHours}:00`, // original: "10:00"
            "endDate": dateString,
            "endTime": `${endTimeHours}:00`, // original: "17:00"
            "participants": [
                { "uid": "R1039801", "email": "simon.meersschaut@student.kuleuven.be"}
            ],
            "summary": [
                "", // Resource **CBA - Boekenzaal Seat 137**
                "", // at **2Bergen Arenberg**
                "", // for **simon.meersschaut&commat;student.kuleuven.be**
                "" // from **Tue Apr 22 10:00** until **Tue Apr 22 17:00**
            ],
            "withCheckIn": false
        };

        try {
            const response = await fetch("https://kurt3.ghum.kuleuven.be/api/reservations/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(bodyData)
            });

            const responseText = await response.text();

            if (response.ok) {
                if (responseText === EXPECTED_RESPONSE) {
                    return (true, "ok");
                } else {
                    console.warn("Unexpected response message:", responseText);
                    return (false, { type: 'Warning', message: responseText });
                }
            } else {
                // Handle non-OK responses
                const responseError = {
                    type: 'Error',
                    status: response.status,
                    message: responseText ? JSON.parse(responseText) : "Unknown error"
                };

                console.error(`Error booking the seat. Status code ${response.status};`);
                console.error(responseError.message)
                return (false, responseError);
            }
        } catch (error) {
            // Handle network or unexpected errors
            console.error("Unexpected error while booking the seat:", error);
            return (false, { type: 'Error', message: error.message });
        }
    }
}