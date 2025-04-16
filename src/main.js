/*

STYLESHEET = ...
*/

function wait_for_authentication(){

}

function clear_DOM(){
    document.head.innerHTML = "";
    document.body.innerHTML = "";
}

function inject_static_content(){
    document.head.innerHTML = STYLESHEET;
}
function inject_script(){
    /*
    This function will return the DOM of a div, corresponding to a zone.
    */
    function create_zone_card(zone_id){
        var zone_name = "Arenberg - Zolder";

        fetch("https://kurt3.ghum.kuleuven.be/api/resourcetypeavailabilities?locationId=1&zoneId="+favorite_zones[zone_index].toString()+"&resourceTypeId=302&pageNumber=0&startDate=2025-04-16&startTime=&endDate=2025-04-16&endTime=&participantCount=1&tagIds=&exactMatch=true&onlyFavorites=false&resourceNameInfix=&version=2.0")
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

    // get availability for favorite zones
    var zone_container = document.createElement("div")
    document.body.appendChild(zone_container);
    var favorite_zones = [14, 15, 16]; // the ids of my favorite zones
    for (var zone_index = 0; zone_index < favorite_zones.length; zone_index++){
        var div = create_zone_card(favorite_zones[zone_index]);
        zone_container.appendChild(div);
    }
}

// main script
// we assume the user is authenticated when the script reaches this point
clear_DOM();
inject_static_content();
inject_script();