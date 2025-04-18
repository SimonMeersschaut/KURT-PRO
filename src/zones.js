/*
This function will return the favorite zones of this user in order.
*/
function fetchFavoriteZones(){
    return [12, 14, 15];
}


/*
This function will return the DOM of a div, corresponding to a zone.
Make sure to check `homepage_zone_card.html` under docs for an example of this div.
*/
function createZoneCard(zoneId){
    var zoneName = "Arenberg - Zolder";

    fetch("https://kurt3.ghum.kuleuven.be/api/resourcetypeavailabilities?locationId=1&zoneId="+zoneId.toString()+"&resourceTypeId=302&pageNumber=0&startDate=2025-04-18&startTime=&endDate=2025-04-18&endTime=&participantCount=1&tagIds=&exactMatch=true&onlyFavorites=false&resourceNameInfix=&version=2.0")
    .then(resp => resp.json())
    .then(data => {
        var availability = data["availabilities"].length;
        // change the number of availability
        var div = document.getElementById("zone_" + zoneId.toString());
        var badge = document.getElementById("zone_" + zoneId.toString() + "_availability");
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
        else if (0 < availability < 20){
            badge.classList.add("text-bg-warning");
        }
        else if (20 < availability){
            badge.classList.add("text-bg-success");
        }
    })
    .catch(error => {
        console.error(error);
        throw new Error("Could not fetch availability.");
    })
    var card = document.createElement('div');
    card.id = "zone_" + zoneId.toString();
    card.classList.add("zone_card");
    card.classList.add("card");
    card.classList.add("card-body");
    card.innerHTML = "<h2>"+zoneName+"</h2><h2 id='zone_"+zoneId+"_availability' class='badge text-bg-secondary'>pending</h2>";
    return card;
}