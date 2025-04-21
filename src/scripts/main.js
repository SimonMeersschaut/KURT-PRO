/*
The build will automatically append css files above using the following format:
A constant variable is made with the name {filename}_css, with the value of the content of the file.
Below is a list of the variables that will be set on build.

homepage_css = ...
day_selector_css = ...
map_css = ...
loader_css = ...
*/

const _MS_PER_DAY = 1000 * 60 * 60 * 24;
var tunnel = null; // will be set once the page has loaded.

const dateToString = (date) => {return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();};

// TODO: docs and split code
function selectDay(selectedDay, mainContainer){
    // Fetch favorite zones of the user
    var favoriteZones = tunnel.getFavoriteZones()
    tunnel.hasReservationOn(selectedDay)
    .then(hasReservation => {
        if (hasReservation){
            // show the reserved seat
            var map = new Map(2, false);
            mainContainer.innerHTML = map.renderDOM();
            tunnel.fetchMapData(2)
            .then(mapData => {
                map.drawSeats(mapData);
            })
            map.handleSeatClick(312, true);
        }
        else{
            // show reservation possibilities
            mainContainer.innerHTML = "";
            for (let zoneIndex = 0; zoneIndex < favoriteZones.length; zoneIndex++){
                var zoneCard = new ZoneCard(favoriteZones[zoneIndex])
                mainContainer.appendChild(zoneCard.renderDOM());
                zoneCard.fetchAvailability(selectedDay);
                zoneCard.onclick = (zoneId) => {
                    mainContainer.innerHTML = "";
                    // Render a new map
                    var map = new Map(zoneId, true);
                    var selectedSeatCard = new SelectedSeatCard();
                    mainContainer.innerHTML = "<div>" + map.renderDOM() + "</div>" + selectedSeatCard.renderDOM();
                    // event listeners
                    map.onSelectSeat = (seatNr, seatId) => {selectedSeatCard.setSeat(seatNr, seatId)};
                    selectedSeatCard.onConfirm = (seatNr, seatId) => {bookSeat(seatId, selectedDay)}; // effectively book that seat
                    // fetch data
                    map.fetchMapData(locationId=10, zoneId=zoneId, selectedDay=selectedDay);
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

    // Create day-selectors
    var daySelector = new DaySelector(true);
    document.body.appendChild(daySelector.renderDOM());

    // Create zone container
    var mainContainer = document.createElement("div")
    document.body.appendChild(mainContainer);
    
    // set onclick event listener of day selectors
    daySelector.onClickDay = (dayIndex) => selectDay(dayIndex, mainContainer);

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