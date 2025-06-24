/*
The build will automatically append css files above using the following format:
A constant variable is made with the name {filename}_css, with the value of the content of the file.
Below is a list of the variables that will be set on build.

main_css = ...
homepage_css = ...
day_selector_css = ...
zone_card_css = ...
map_css = ...
loader_css = ...
clock_css = ...
*/

const _MS_PER_DAY = 1000 * 60 * 60 * 24;
var tunnel = null; // will be set once the page has loaded.
var settings = null;
var clock = null;
var daySelector = null;

const dateToString = (date) => {
    if (!(date instanceof Date))
        throw new Error("`date` was not a `Date` object.");
    return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
};

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

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

dayIndex = null;
selectedDay = null;


function viewZone(mainContainer, locationId, zoneId){
    // Show the map of that zone
    mainContainer.innerHTML = "";
    var map = new Map(zoneId, true);
    var selectedSeatCard = new SelectedSeatCard(buttons=[
        new Button(
            1, // type
            "Book", // text
            (seatNr, seatId, startTimeHours, endTimeHours) => {
                // effectively book that seat
                // updates the tunnel cache too!
                bookSeat(dayIndex, seatNr, seatId, selectedDay, startTimeHours, endTimeHours)
                .then((success) => {
                    if (success){
                        // update the page
                        selectDay(mainContainer);
                    }
                    else{
                        // error
                        throw new Error("An error occured while booking the seat. Please check the console for more details.");
                    }
                })
            }
        )
    ]);
    // render dom
    const mapContainer = document.createElement("div");
    mapContainer.id = "map-container";
    mapContainer.appendChild(map.renderDOM());
    mainContainer.appendChild(mapContainer);
    mainContainer.appendChild(selectedSeatCard.renderDOM());
    // event listeners
    map.onSelectSeat = (seatNr, seatId) => {selectedSeatCard.setSeat(seatNr, seatId)};
    // fetch data
    map.fetchMapData(locationId=locationId, zoneId=zoneId, selectedDay=selectedDay, startTime=clock.startTime, endTime=clock.endTime);
}

// TODO: docs and split code
function selectDay(mainContainer){
    // Fetch favorite zones of the user
    tunnel.hasReservationOn(dayIndex)
    .then(reservationData => {
        if (reservationData != null){
            clock.hide();
            // get the id of the map
            let zone_id = null;
            if (reservationData["resourceName"].startsWith("CBA - Zolder Seat "))
                zone_id = 14;
            else if (reservationData["resourceName"].startsWith("Agora - Silent Study Seat "))
                zone_id = 2;
            else if (reservationData["resourceName"].startsWith("CBA - Boekenzaal Seat "))
                zone_id = 11;
            else throw new Error(`Identifier of zone '${reservationData["resourceName"]}' was not found. (seatNr: ${reservationData["seatNr"]})`);
            // show the reserved seat
            var map = new Map(zone_id, false);
            // show a information card
            var selectedSeatCard = new SelectedSeatCard(buttons=[
                new Button(
                    1, // type
                    "Change", // text
                    () => {window.location.assign(`/edit-reservation/${reservationData.id}`);} // go to the page to edit the reservation
                ),
                new Button(
                    2, // type
                    "Cancel", // text
                    () => {window.location.assign(`/reservations`);} // manage all reservations
                ),
            ]);
            // remove all elements in main container
            mainContainer.innerHTML = ""; 
            // Render new DOM
            mainContainer.appendChild(map.renderDOM());
            mainContainer.appendChild(selectedSeatCard.renderDOM());
            selectedSeatCard.setSeat(reservationData.seatNr, null);
            selectedSeatCard.startTimeHours = parseInt(reservationData.startTime.split(":")[0]);
            selectedSeatCard.endTimeHours = parseInt(reservationData.endTime.split(":")[0]);
            selectedSeatCard.updateSeatTime();
            // selectDay
            tunnel.fetchMapData(zone_id)
            .then(mapData => {
                map.drawSeats(mapData);
                map.handleSeatClick(seatNr=reservationData.seatNr, forceSelect=true);
            })
        }
        else{
            clock.show();
            // No reservation, show zones
            mainContainer.innerHTML = "";
            // show all favorite zones
            const favoriteZones = settings.getFavoriteZones();
            for (let zoneIndex = 0; zoneIndex < favoriteZones.length; zoneIndex++){
                // for each zone
                var zoneCard = new ZoneCard(favoriteZones[zoneIndex])
                mainContainer.appendChild(zoneCard.renderDOM());
                zoneCard.fetchAvailability(selectedDay, clock.startTime, clock.endTime);
                zoneCard.onclick = (locationId, zoneId) => {viewZone(mainContainer, locationId, zoneId)};
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
        daySelector = new DaySelector(false);
        document.body.appendChild(daySelector.renderDOM());

        // render the filters
        var filtersContainer = document.createElement("div")
        filtersContainer.id = "filter-container";
        clock.onupdate = () => {
            settings.startTimeHours = clock.startTime;
            settings.endTimeHours = clock.endTime;
            selectDay(mainContainer)
        };
        filtersContainer.appendChild(clock.renderDOM());
        filtersContainer.appendChild(settings.renderDOM());
        document.body.appendChild(filtersContainer);
    
        // Create zone container
        var mainContainer = document.createElement("div")
        mainContainer.id = "main";
        document.body.appendChild(mainContainer);
        
        // set onclick event listener of day selectors
        daySelector.onClickDay = (_dayIndex, _selectedDay) => {
            dayIndex=_dayIndex;
            selectedDay=_selectedDay;

            // if you selected the 8th day and 
            if (_dayIndex == 8){
                if (new Date().getHours() < 18){
                    // NOK, day not available yet
                    mainContainer.innerHTML = "";
                    const p = document.createElement("p");
                    p.innerText = "This will be available at 18:00.";
                    mainContainer.appendChild(p);
                    return;
                }
            }
            selectDay(mainContainer)
        };
    
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

function onLoad(){
    // Check if the extention should run on this url
    if (activeUrl()){
        /*
        The settings will handle both the visual interface of the settings,
        as well as holding the data (your current preferences).
        */
        settings = new Settings();
        /*
        The clock is a user interface to select a time (for reservations).
        */
        clock = new Clock();
        /*
        The tunnel will be an interface between the front-end and the back-end and will perform caching.
        */
        tunnel = new Tunnel();
        // run main
        main();
    }
    else{
        // show a button to go back to KURT PRO
        const button = createBanner();
        button.innerText = "KURT-PRO";
        button.onclick = () => {window.location.assign("#kurt-pro"); setTimeout(() => {onLoad()}, 100);}
        const container = document.body.getElementsByClassName("page-outlet")[0]
        if (container == null){
            // on a safari browser, it seemed like the container couldnt be found.
            document.body.insertBefore(button, document.body.firstChild);
        }
        else{
            container.insertBefore(button, container.firstChild);
        }
        // check for edit reservation
        if (isChangeReservationUrl()){
            setTimeout(() => {
                document.getElementById("mat-input-0").value = "Study";
                document.getElementById("mat-input-1").value = "(KURT-PRO) Change the details of the reservation.";

                const inputs = document.getElementsByTagName("input");
                for (let i = 0; i < inputs.length; i++)
                    if (inputs[i].type == "checkbox")
                        inputs[i].dispatchEvent(new Event("click")); // click on the disclaimer
            }, 100);
        }
    }
}
// Call the main function when the entire page was loaded
document.body.onload = onLoad;