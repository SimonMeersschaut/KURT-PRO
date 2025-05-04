/*
The build will automatically append css files above using the following format:
A constant variable is made with the name {filename}_css, with the value of the content of the file.
Below is a list of the variables that will be set on build.

homepage_css = ...
day_selector_css = ...
map_css = ...
loader_css = ...
clock_css = ...
*/

const _MS_PER_DAY = 1000 * 60 * 60 * 24;
var tunnel = null; // will be set once the page has loaded.
var settings = null;

const dateToString = (date) => {
    if (!(date instanceof Date))
        throw new Error("`date` was not a `Date` object.");
    return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
};

/*
Calculates the dayIndex based on the selectedDay.
The dayIndex represents the difference in days between the selectedDay and the current day.
This implementation avoids rounding issues by normalizing both dates to midnight.
*/
function calculateDayIndex(selectedDay) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24; // Milliseconds in a day

    // Normalize both dates to midnight
    const today = new Date();
    const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedDayAtMidnight = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate());

    // Calculate the difference in days
    return Math.floor((selectedDayAtMidnight - todayAtMidnight) / _MS_PER_DAY);
}

// TODO: docs and split code
function selectDay(dayIndex, selectedDay, mainContainer){
    // Fetch favorite zones of the user
    var favoriteZones = tunnel.getFavoriteZones()
    tunnel.hasReservationOn(dayIndex)
    .then(reservedSeatNr => {
        if (reservedSeatNr != null){
            // show the reserved seat
            var map = new Map(2, false);
            mainContainer.innerHTML = map.renderDOM();
            tunnel.fetchMapData(2)
            .then(mapData => {
                map.drawSeats(mapData);
                map.handleSeatClick(reservedSeatNr, true);
            })
        }
        else{
            // show all zones
            mainContainer.innerHTML = "";
            for (let zoneIndex = 0; zoneIndex < favoriteZones.length; zoneIndex++){
                // for each zone
                var zoneCard = new ZoneCard(favoriteZones[zoneIndex])
                mainContainer.appendChild(zoneCard.renderDOM());
                zoneCard.fetchAvailability(selectedDay, settings.startTimeHours, settings.endTimeHours);
                zoneCard.onclick = (zoneId) => {
                    // Show the map of that zone
                    mainContainer.innerHTML = "";
                    var map = new Map(zoneId, true);
                    var selectedSeatCard = new SelectedSeatCard();
                    var clock = new Clock();
                    mainContainer.innerHTML = `<div id="filter-container">` + "</div>" + "<div>" + map.renderDOM() + "</div>" + selectedSeatCard.renderDOM();
                    document.getElementById("filter-container").appendChild(clock.renderDOM());
                    // event listeners
                    map.onSelectSeat = (seatNr, seatId) => {selectedSeatCard.setSeat(seatNr, seatId)};
                    selectedSeatCard.onConfirm = (seatNr, seatId, startTimeHours, endTimeHours) => {bookSeat(seatId, selectedDay, startTimeHours, endTimeHours)}; // effectively book that seat
                    clock.onupdate = () => {
                        // update settings
                        settings.startTimeHours = clock.startTime;
                        settings.endTimeHours = clock.endTime;
                        // update selectedCard
                        selectedSeatCard.startTimeHours = clock.startTime;
                        selectedSeatCard.endTimeHours = clock.endTime;
                        selectedSeatCard.updateSeatTime();
                        map.fetchMapData(locationId=10, zoneId=zoneId, selectedDay=selectedDay, startTime=clock.startTime, endTime=clock.endTime);
                    }
                    // fetch data
                    map.fetchMapData(locationId=10, zoneId=zoneId, selectedDay=selectedDay, startTime=clock.startTime, endTime=clock.endTime);
                }
            }
        }
    })
}

function main(){
    
    /* Setup & Initialize the webpage */
    enforceAuthentication()
    .then(success => {
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
        mainContainer.id = "main";
        document.body.appendChild(mainContainer);
        
        // set onclick event listener of day selectors
        daySelector.onClickDay = (dayIndex, selectedDay) => {selectDay(dayIndex, selectedDay, mainContainer)};
    
        // Fetch future reservations and update the selectors
        tunnel.getReservedDays()
        .then(reservedDays => {
            daySelector.reservedDays = reservedDays;
            daySelector.updateClasses();
            // // open today
            daySelector.selectDay(0);
        })
        .catch(error => {
            console.error("Error updating reserved days:", error);
        });
    })
}

// Call the main function when the entire page was loaded
document.body.onload = () => {
    /*
    The settings will handle both the visual interface of the settings,
    as well as holding the data (your current preferences).
    */
    settings = new Settings();
    /*
    The tunnel will be an interface between the front-end and the back-end and will perform caching.
    */
    tunnel = new Tunnel();
    // run main
    main();
}