/*
Each instance of this class represents a card (shown in the main page) for one zone.
This card contains the name of the zone and the available seats for the selected day and time.
*/
class ZoneCard{
    constructor(zoneId){
        // get zoneData based on zoneId
        const candidates = ALL_ZONES.filter((item) => item["zoneId"] == zoneId)
        if (zoneId == NaN)
            log.error("`zoneId` was NaN.")
        if (candidates.length == 1)
            this.zoneData = candidates[0];
        else if (candidates.length > 1)
            log.error(`Too many candidates for zoneId=${zoneId}`);
        else
            log.error(`No candidates for zoneId=${zoneId}`);

        this.onclick = null; // defualt value
    }

    /*
    This function will return the DOM of a div, corresponding to a zone.
    Make sure to check `homepage_zone_card.html` under docs for an example of this div.

    - zoneData: {
            "locationId": 10, // The location of the library
            "zoneId": 2, // the identifier of this zone
            "name": "Agora - Silent study 2" // a descriptive name of this zone
        }
    */
    renderDOM(){
        // Create DOM
        var card = document.createElement('div');
        card.id = "zone_" + this.zoneData["zoneId"].toString();
        card.classList.add("zone_card");
        card.classList.add("card");
        card.classList.add("card-body");
        card.innerHTML = "<h2>"+this.zoneData["name"]+"</h2><h2 id='zone_"+this.zoneData["zoneId"]+"_availability' class='badge text-bg-secondary'>pending</h2>";

        card.onclick = () => {this.onclick(this.zoneData["locationId"], this.zoneData["zoneId"], this.zoneData["name"])};
        return card;
    }

    /*
    This function will fetch availability and update the number in the DOM.
    In order to see all seats, the script has to fetch multiple pages, for which the arguments are used.

    params
    - page: (default 0) what page the function should fetch
    */
    fetchAvailability(selectedDay, startTime, endTime){
        (async () => {
            const seatGenerator = tunnel.getAvailableSeatsNumber(this.zoneData["locationId"], this.zoneData["zoneId"], selectedDay, startTime, endTime);
            var availability = 0;
            var div = document.getElementById("zone_" + this.zoneData["zoneId"].toString());
            var badge = document.getElementById("zone_" + this.zoneData["zoneId"].toString() + "_availability");
            for await (availability of seatGenerator) {
                // change the number of availability
                if (div == null){
                    log.warn("Could not find zoneCard div. Perhaps the user clicked on a zone before the request was finished.");
                    return;
                }else{
                    badge.innerText = availability.toString();
                }
                // set badge color based on avalability
                if (availability == 0){
                    // make unclickable
                    badge.className = "badge text-bg-secondary text-bg-dark disabled";
                }
                else if (0 < availability && availability < 60){
                    badge.className = "badge text-bg-secondary text-bg-warning";
                }
                else{
                    badge.className = "badge text-bg-secondary text-bg-success";
                }
            }
            // set badge color based on avalability
            if (availability == 0){
                // make unclickable
                badge.className = "badge text-bg-secondary text-bg-dark disabled";
            }
            else if (0 < availability && availability < 60){
                badge.className = "badge text-bg-secondary text-bg-warning";
            }
            else{
                badge.className = "badge text-bg-secondary text-bg-success";
            }
        })();
    }
}


