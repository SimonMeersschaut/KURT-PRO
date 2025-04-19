/*
The build will automatically append css files above using the following format:
A constant variable is made with the name {filename}_css, with the value of the content of the file.
Below is a list of the variables that will be set on build.

homepage_css = ...
day_selector_css = ...
map_css = ...
*/

const _MS_PER_DAY = 1000 * 60 * 60 * 24;
var tunnel = null; // will be set once the page has loaded.


function selectDay(dayIndex){
    const d = new Date(new Date().getTime() + dayIndex * _MS_PER_DAY);
    tunnel.hasReservationOn(dayIndex)
    .then(hasReservation => {
        if (hasReservation){
            // show the reserved seat
            var map = new Map(2, false);
            zoneContainer.innerHTML = map.renderDOM();
            tunnel.fetchMapData(2)
            .then(mapData => {
                map.drawSeats(mapData);
            })
            map.handleSeatClick(312, true);
        }
        else{
            // show reservation possibilities
            zoneContainer.innerHTML = "";
            for (let zoneIndex = 0; zoneIndex < favoriteZones.length; zoneIndex++){
                var zoneCard = new ZoneCard(favoriteZones[zoneIndex])
                zoneContainer.appendChild(zoneCard.renderDOM());
                zoneCard.fetchAvailability(d);
                zoneCard.onclick = (id) => {
                    zoneContainer.innerHTML = "";
                    // show the reserved seat
                    var map = new Map(2, false);
                    zoneContainer.innerHTML = map.renderDOM();
                    tunnel.fetchMapData(2)
                    .then(mapData => {
                        map.drawSeats(mapData);
                    })
                    map.handleSeatClick(312, true);
                }
            }
        }
    })
}

function main(){
    /* Setup & Initialize the webpage */
    var success = enforceAuthentication();
    if (!success){
        throw new Error("User could not be authenticated.");
    }
    // we assume the user is authenticated when the script reaches this point
    clearDOM();
    injectStaticContent();
    
    /* Create custom page. */
    // Fetch favorite zones of the user
    var favoriteZones = tunnel.getFavoriteZones()

    // Create day-selectors
    var daySelector = new DaySelector(true);
    document.body.appendChild(daySelector.renderDOM());

    // Create zone container
    var zoneContainer = document.createElement("div")
    document.body.appendChild(zoneContainer);
    
    // set onclick event listener of day selectors
    daySelector.onClickDay = selectDay;

    // Fetch future reservations and update the selectors
    tunnel.getReservedDays()
    .then(reservedDays => {
        daySelector.reservedDays = reservedDays;
        daySelector.updateClasses();
    })
    .catch(error => {
        console.error("Error updating reserved days:", error);
    });

    
}

// Call the main function when the entire page was loaded
document.body.onload = () => {
    /*
    The tunnel will be an interface between the front-end and the back-end and will perform caching.
    */
    tunnel = new Tunnel();
    // run main
    main();
}