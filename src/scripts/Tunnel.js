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
        this.dayCaches = [new DayCache(), new DayCache(), new DayCache(), new DayCache(), new DayCache(), new DayCache(), new DayCache(), new DayCache(), new DayCache()];
        this.reservationCache = null;
        this.usageCache = -1;
        this.accountCache = null;
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
            console.warn("fetched again?");
        }
        else{
            data = this.reservationCache;
            console.log("Data:");
            console.log(data);
        }

        try {
            const output = [null, null, null, null, null, null, null, null];
            const d = new Date();

            data.forEach(reservation => {
                const date = new Date(reservation["startDate"]);
                const dayIndex = dateDiffInDays(d, date);
                console.log("Date:");
                console.log(date);
                console.log("DayIndex:");
                console.log(dayIndex);
                if (dayIndex >= 0 && dayIndex <= 7) {
                    let seatNr = parseInt(reservation["resourceName"].split(" ")[reservation["resourceName"].split(" ").length - 1]);
                    const data = {... reservation, seatNr: seatNr}
                    output[dayIndex] = data;
                    console.log("Current output data: ");
                    console.log(output);
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
        console.log(reservedDays);
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
            "participants":[{"uid":r-number,"email":email}],
            "summary":["Resource **CBA - Boekenzaal Seat 137**","at **2Bergen Arenberg**","for **simon.meersschaut&commat;student.kuleuven.be**","from **Tue Apr 22 9:00** until **Tue Apr 22 10:00**"],
            "withCheckIn":false
        }
    EXPECTED MESSAGE: "Your reservation has been created. You will receive an e-mail confirmation. The following attendees were validated: R1039801;. (Do not forget to log off on public computers.)"
    */
    async bookSeat(dayIndex, seatNr, seatId, startDateString, endDateString, startTimeHours, endTimeHours) {
        const bodyData = {
            "id": parseInt(seatId),
            "resourceName": ` ${seatNr}`, // original "CBA - Boekenzaal Seat 137" // TODO: volledige naam?
            "subject": "", // original: "CBA - Boekenzaal Seat 137"
            "purpose": "",
            "resourceId": parseInt(seatId),
            "startDate": startDateString,
            "startTime": `${startTimeHours}:00`, // original: "10:00"
            "endDate": endDateString,
            "endTime": `${endTimeHours}:00`, // original: "17:00"
            "participants": [
                await settings.getUser()
            ],
            "summary": [
                "", // Resource **CBA - Boekenzaal Seat 137**
                "", // at **2Bergen Arenberg**
                "", // for **simon.meersschaut&commat;student.kuleuven.be**
                "" // from **Tue Apr 22 10:00** until **Tue Apr 22 17:00**
            ],
            "withCheckIn": false
        };

        const response = await fetch("https://kurt3.ghum.kuleuven.be/api/reservations/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(bodyData)
        });
        if (!response.ok) throw new Error("Could not make the reservation.");

        const responseText = await response.text();

        if (response.ok) {
            console.log(this.reservationCache);
            if (this.reservationCache != null){
                this.reservationCache.push(bodyData);
                console.log("Added to reservationCache. New cache:");
                console.log(this.reservationCache);
            }

            if (responseText.startsWith('"Your reservation has been created.')) {
                // OK, reservation created successfully.
                this.usageCache = this.usageCache + (endTimeHours - startTimeHours);
                return;
            } else {
                console.warn("Unexpected response message: '" + responseText + "'");
                return;
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
            throw new Error(responseError.message);
        }
    }

    /**
     * {
            "uid": REDACTED,
            "email": "simon.meersschaut@student.kuleuven.be",
            "commonName": "Simon Meersschaut",
            "firstName": "Simon",
            "lastName": "Meersschaut",
            "quota": [
                {
                    "resourceType": "Group Work Room",
                    "usageDay": 0,
                    "usageWeek": 0,
                    "maxUsageDay": 4,
                    "maxUsageWeek": 12
                },
                {
                    "resourceType": "Study Seat",
                    "usageDay": 0,
                    "usageWeek": 0,
                    "maxUsageDay": 16,
                    "maxUsageWeek": 48
                },
                {
                    "resourceType": "Collection Seat",
                    "usageDay": 0,
                    "usageWeek": 0,
                    "maxUsageDay": 16,
                    "maxUsageWeek": 48
                }
            ]
        }
     */
    async getUssage(){
        // if already cached, return the cache result
        if (this.usageCache >= 0) return this.usageCache;
        
        // otherwise fetch the users usage
        const response = await fetch("https://kurt3.ghum.kuleuven.be/api/account", {
            method: "GET",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        });

        if (!response.ok) throw new Error("Could not fetch current ussage.");

        const data = await response.json();

        const usage = data["quota"][1]["usageWeek"];
        this.usageCache = usage;
        return usage;
    }

    /**
     * 
     */
    async getAccountInfo(){
        // if the account is already cached, return the cache result
        if (this.accountCache != null) return this.accountCache;
        
        // otherwise fetch the account
        const response = await fetch("https://kurt3.ghum.kuleuven.be/api/information", {
            method: "GET",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        });

        if (!response.ok) throw new Error("Could not fetch this user.");
        
        const data = response.json();
        this.accountCache = data;
        return data;
    }
}