class ZoneCard{
    constructor(zoneData){
        this.zoneData = zoneData;
        this.onclick = null; // defualt value
    }

    /*
    This function will return the DOM of a div, corresponding to a zone.
    Make sure to check `homepage_zone_card.html` under docs for an example of this div.

    - zoneData: {
            "location": 10, // The location of the library
            "id": 2, // the identifier of this zone
            "name": "Agora - Silent study 2" // a descriptive name of this zone
        }
    */
    renderDOM(){
        // Create DOM
        var card = document.createElement('div');
        card.id = "zone_" + this.zoneData["id"].toString();
        card.classList.add("zone_card");
        card.classList.add("card");
        card.classList.add("card-body");
        card.innerHTML = "<h2>"+this.zoneData["name"]+"</h2><h2 id='zone_"+this.zoneData["id"]+"_availability' class='badge text-bg-secondary'>pending</h2>";
        card.onclick = () => {this.onclick(this.zoneData["id"])};
        return card;
    }

    /*
    This function will fetch availability and update the number in the DOM.
    In order to see all seats, the script has to fetch multiple pages, for which the arguments are used.

    params
    - page: (default 0) what page the function should fetch
    - offset: (defualt 0) how many seats the previous page had (cummulatively)
    */
    fetchAvailability(date){
        (async () => {
            const seatGenerator = tunnel.getAvailableSeatsNumber(this.zoneData["location"], this.zoneData["id"], date);
            for await (const availability of seatGenerator) {
                // change the number of availability
                var div = document.getElementById("zone_" + this.zoneData["id"].toString());
                var badge = document.getElementById("zone_" + this.zoneData["id"].toString() + "_availability");
                if (div == null){
                    console.log("Could not find zoneCard div. Perhaps the user clicked on a zone before the request was finished.");
                    return;
                }else{
                    badge.innerText = availability.toString();
                }
                // set badge color based on avalability
                badge.classList.remove("text-bg-secondary");
                if (availability == 0){
                    badge.classList.add("text-bg-dark");
                    // make unclickable
                    div.classList.add("disabled");
                }
                else if (0 < availability && availability < 20){
                    badge.classList.add("text-bg-warning");
                }
                else{
                    badge.classList.add("text-bg-success");
                }
            }
        })();
    }
}


