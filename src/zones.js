/*
This function will return the favorite zones of this user in order.
*/
function fetch_favorite_zones(){
    return [12, 14, 15];
}


/*
This function will return the DOM of a div, corresponding to a zone.
Make sure to check `homepage_zone_card.html` under docs for an example of this div.
*/
function create_zone_card(zone_id){
    var zone_name = "Arenberg - Zolder";

    fetch("https://kurt3.ghum.kuleuven.be/api/resourcetypeavailabilities?locationId=1&zoneId="+zone_id.toString()+"&resourceTypeId=302&pageNumber=0&startDate=2025-04-16&startTime=&endDate=2025-04-16&endTime=&participantCount=1&tagIds=&exactMatch=true&onlyFavorites=false&resourceNameInfix=&version=2.0")
    .then(resp => resp.json())
    .then(data => {
        var availability = data["availabilities"].length;
        // change the number of availability
        var div = document.getElementById("zone_" + zone_id.toString() + "_availability");
        if (div == null){
            throw new Error("could not find div.");
        }else{
            div.innerText = availability.toString();
        }
    })
    var card = document.createElement('div');
    card.id = "zone_" + zone_id.toString();
    card.classList.add("zone_card");
    card.innerHTML = "<h2>"+zone_name+"</h2><span id='zone_"+zone_id+"_availability'>pending</span>";
    return card;
}