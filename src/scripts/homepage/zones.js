/*
This function will return the favorite zones of this user in order.
*/
function fetchFavoriteZones(){
    return [
        {"location": 10, "id": 2, "name": "Agora - Silent study 2"},
        {"location": 1, "id": 14, "name": "Agora - De zolder"},
        {"location": 1, "id": 11, "name": "Agora - De boekenzaal"},
    ]
}

/*
This function will fetch availability and update the number in the DOM.
In order to see all seats, the script has to fetch multiple pages, for which the arguments are used.

params
- page: (default 0) what page the function should fetch
- offset: (defualt 0) how many seats the previous page had (cummulatively)
*/
function fetchZoneAvailability(zoneData, date, page, offset){
    const dateString = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
    fetch("https://kurt3.ghum.kuleuven.be/api/resourcetypeavailabilities?locationId="+zoneData["location"]+"&zoneId="+zoneData["id"].toString()+"&resourceTypeId=302&pageNumber="+page+"&startDate="+dateString+"&startTime=&endDate="+dateString+"&endTime=&participantCount=1&tagIds=&exactMatch=true&onlyFavorites=false&resourceNameInfix=&version=2.0")
    .then(resp => resp.json())
    .then(data => {
        var pageAvailability = data["availabilities"].length;
        var availability = pageAvailability + offset;
        // change the number of availability
        var div = document.getElementById("zone_" + zoneData["id"].toString());
        var badge = document.getElementById("zone_" + zoneData["id"].toString() + "_availability");
        if (div == null){
            throw new Error("could not find div.");
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

        if (pageAvailability == 60){
            // we didnt see the entire list yet, the next function will give it another try
            fetchZoneAvailability(zoneData, date, page+1, offset+availability);
        }
    })
    .catch(error => {
        console.error(error);
        throw new Error("Could not fetch availability.");
    })
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
function createZoneCard(zoneData, date){
    fetchZoneAvailability(zoneData, date, 0, 0);
    // Create DOM
    var card = document.createElement('div');
    card.id = "zone_" + zoneData["id"].toString();
    card.classList.add("zone_card");
    card.classList.add("card");
    card.classList.add("card-body");
    card.innerHTML = "<h2>"+zoneData["name"]+"</h2><h2 id='zone_"+zoneData["id"]+"_availability' class='badge text-bg-secondary'>pending</h2>";
    card.onclick = () => {document.location.assign("/locations/"+zoneData["location"].toString()+"?zone="+zoneData["id"].toString())}
    return card;
}