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
        const dayCaches = [new DayCache(), new DayCache(), new DayCache(), new DayCache(), new DayCache(), new DayCache(), new DayCache()];
        var reservationCache = null;
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
            const output = [false, false, false, false, false, false, false];
            const d = new Date();

            data.forEach(reservation => {
                const date = new Date(reservation["startDate"]);
                const dayIndex = dateDiffInDays(d, date);
                if (dayIndex >= 0 && dayIndex <= 6) {
                    output[dayIndex] = true;
                }
            });
            return output;
        } catch (error) {
            console.error("Error fetching reserved days:", error);
            return [false, false, false, false, false, false, false];
        }
    }

    async fetchMapData(zoneId){
        try {
            const response = await fetch(`https://raw.githubusercontent.com/SimonMeersschaut/KURT-PRO/refs/heads/Maps/resources/maps/zones/${zoneId}/compression.json`);
            const data = await response.json();
            return data;
        }
        catch(error){
            console.error("Error fetching reserved days:", error);
            return {};
        }
    }

    async hasReservationOn(dayIndex){
        const reservedDays = await this.getReservedDays();
        return reservedDays[dayIndex];
    }

    async *getAvailableSeats(locationId, zoneId, date){
        const dateString = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
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
                // TODO: cache
                page++;
            } while (seatsOnPage > 0 && seatsOnPage == 60);
        } catch (error) {
            console.error("Error fetching available seats:", error);
        }
    }

    /*
    Get the number of available seats on this day.
    The function fetches the backend page by page and will yield the intermediate results.
    Hence, the backend sends the seats in pages of 60 seats, so we have to calculate the cummulative sum.
    We assume that there are no more than 10 pages and use this to avoid infinite loops.
    */
    async *getAvailableSeatsNumber(locationId, zoneId, date) {
        var cummulativeSum = 0;

        const seatGenerator = tunnel.getAvailableSeats(locationId, zoneId, date);
        for await (const availableSeats of seatGenerator) {
            cummulativeSum += availableSeats.length;
            yield cummulativeSum; // Yield the number of seats on the current page
        }
    }

    async *freeSeats(locationId, zoneId, date){
        const seatGenerator = tunnel.getAvailableSeats(locationId, zoneId, date);
        for await (const availableSeats of seatGenerator) {
            // avaiableSeats is a list of dictionaries
            for await (const availableSeat of availableSeats){
                // availableSeat: {"name": "Agora - Silent Study Seat 236", ...}
                // splits the name "... Seat 236" -> 236
                let id = await availableSeat["name"].split(" ")[availableSeat["name"].split(" ").length - 1];
                try{
                    yield parseInt(id);
                }
                catch(error){
                    console.error(error);
                }
            }
        }
    }
}