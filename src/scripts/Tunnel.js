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
It is advised to make only one instance of this class.
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
            {"location": 1, "id": 14, "name": "Arenberg - De zolder"},
            {"location": 1, "id": 11, "name": "Arenberg - De boekenzaal"},
        ]
    }

    /*
    TODO: docs
    */
    async getReservedDays() {
        var data;
        if (this.reservationCache == null){
            const response = await fetch("https://kurt3.ghum.kuleuven.be/api/reservations");
            if (!response.ok) throw new Error("Could not fetch reservations.");
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
                    const data = {... reservation, seatNr: seatNr}
                    output[dayIndex] = data;
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
            const response = await fetch(`https://raw.githubusercontent.com/SimonMeersschaut/KURT-PRO/refs/heads/main/resources/maps/zones/${zoneId}/compression.json`);
            if (!response.ok) throw new Error("Could not fetch zoneData from github.");
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
    async *getDayData(locationId, zoneId, selectedDay, startTime, endTime){
        function filter(seatData, startTime, endTime){
            for (let hourIterator = startTime; hourIterator < endTime; hourIterator++){
                // console.log("ok");
                if (seatData["slotAllocation"][hourIterator - 8] != 'A'){
                    // NOK, this hour is not available
                    return false;
                }
            }
            return true; // all hours are available
        }
        const dayIndex = calculateDayIndex(selectedDay);
        const zoneCache = this.dayCaches[dayIndex].getZoneCache(zoneId);
        if (zoneCache == undefined) 
            throw new Error("`zoneCache` cannot be `null`.");
        if (zoneCache.isValid()){
            // return items of `zoneCache.content` individually
            for (let seatIndex = 0; seatIndex < zoneCache.content.length; seatIndex++){
                const seatData = zoneCache.content[seatIndex];
                if (filter(seatData, startTime, endTime)){
                    yield seatData;
                }
            }
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
                        `https://kurt3.ghum.kuleuven.be/api/resourcetypeavailabilities?locationId=${locationId}&zoneId=${zoneId}&resourceTypeId=302&pageNumber=${page}&startDate=${dateString}&startTime=&endDate=${dateString}&endTime=&participantCount=1&tagIds=&exactMatch=true&onlyFavorites=false&resourceNameInfix=&version=2.0`
                    );
                    if (!response.ok) throw new Error("Could not fetch resource availabilities.");
                    const availableSeats = (await response.json())['availabilities'];
                    seatsOnPage = await availableSeats.length;
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    // yield availableSeats;
                    // add all availableSeats to the cache
                    for (let seatIndex = 0; seatIndex < availableSeats.length; seatIndex++){
                        var seatData = availableSeats[seatIndex];
                        // availableSeat: {"name": "Agora - Silent Study Seat 236", ...}
                        // splits the name "... Seat 236" -> 236
                        seatData['seatNr'] = parseInt(seatData["name"].split(" ")[seatData["name"].split(" ").length - 1]);
                        // Add this seat to the zoneCache
                        zoneCache.push(seatData);
                        // Yield each seat individually
                        if (filter(seatData, startTime, endTime)){
                            yield seatData;
                        }
                    }
                    page++;
                } while (seatsOnPage > 0 && seatsOnPage == 60);
            } catch (error) {
                console.error("Error fetching available seats:", error);
            }
            // updated entire cache
            zoneCache.setValid();
        }
        return;
    }

    /*
    Get the number of available seats on this day.
    The function fetches the backend page by page and will yield the intermediate results.
    Hence, the backend sends the seats in pages of 60 seats, so we have to calculate the cummulative sum.
    We assume that there are no more than 10 pages and use this to avoid infinite loops.
    */
    async *getAvailableSeatsNumber(locationId, zoneId, selectedDay, startTime, endTime) {
        var cummulativeSum = 0;
        
        const seatGenerator = tunnel.getDayData(locationId, zoneId, selectedDay, startTime, endTime);
        for await (const _ of seatGenerator) {
            cummulativeSum += 1;
            yield cummulativeSum; // Yield the number of seats on the current page
        }
        yield cummulativeSum;
        return;
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
            if (!response.ok) throw new Error("Could not fetch previous reservations.");

            const responseText = await response.text();

            if (response.ok) {
                if (responseText.startsWith("Your reservation has been created.")) {
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