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

const ALL_ZONES = [
    {"locationId": 10, "zoneId": 2, "name": "Agora - Silent study 2"},
    ...
];
*/



const _MS_PER_DAY = 1000 * 60 * 60 * 24;
var tunnel = null; // will be set once the page has loaded.
var settings = null;
var daySelector = null;
var log = null;

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

function getZoneId(name, nr){
    if (name.startsWith("CBA - Zolder Seat "))
        return 14;
    else if (name.startsWith("Agora - Silent Study Seat ")){
        if (nr < 200)
            return 1;
        else
            return 2;
    }
    else if (name.startsWith("CBA - Boekenzaal Seat "))
        return 11;
    else throw new Error(`Identifier of zone '${name}' was not found. (seatNr: ${nr})`);
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

// TODO: docs and split code
function selectDay(mainContainer){
    // Fetch favorite zones of the user
    tunnel.hasReservationsOn(dayIndex)
    .then(reservationsData => {
        // remove all elements in main container
        mainContainer.innerHTML = "";
        if (reservationsData.length > 0){
            // There already are reservations.
            for (let i=0; i<reservationsData.length; i++){
                reservationData = reservationsData[i];
                // get the id & name of the map
                if (reservationData["zoneId"] !== undefined)
                    zone_id = reservationData["zoneId"]; // cached from a reservation just made!
                else
                    zone_id = getZoneId(reservationData["resourceName"], reservationData["seatNr"]);
                const zoneName = reservationData["resourceName"].split(" - ")[1]
                // zoneName = zoneName.substring(0, zoneName.lastIndexOf(" ")); // remove last word (the seat number)
                var map = new Map(0, zone_id, zoneName); // FIXME locationId
                mainContainer.appendChild(map.renderDOM());
                map.showReservation(reservationData);
            }
        }
        // More reservations button
        const moreReservationsContainer = document.createElement("div");
        const moreReservationsMainContainer = document.createElement("div");

        let clock = new Clock();
        moreReservationsContainer.appendChild(clock.renderDOM());
        clock.hide();
        addButton = new Button(1, "Add reservation", () => {
            clock.show();
            // show zones
            clock.onupdate = () => {
                moreReservationsMainContainer.innerHTML = "";

                // show all favorite zones
                const favoriteZoneIds = settings.getFavoriteZoneIds();
                for (let zoneIndex = 0; zoneIndex < favoriteZoneIds.length; zoneIndex++){
                    // for each zone
                    var zoneCard = new ZoneCard(favoriteZoneIds[zoneIndex]);
                    moreReservationsMainContainer.appendChild(zoneCard.renderDOM());
                    zoneCard.fetchAvailability(selectedDay, clock.startTime, clock.endTime);
                    zoneCard.onclick = (locationId, zoneId, zoneName) => {
                        // Show the map of that zone
                        moreReservationsMainContainer.innerHTML = "";
                        var map = new Map(locationId, zoneId, zoneName);
                        map.fetchMapData(locationId, zoneId, selectedDay, clock.startTime, clock.endTime);
                        // render dom
                        moreReservationsMainContainer.appendChild(map.renderDOM());
                    };
                }
            };
            clock.onupdate();
        });
        moreReservationsMainContainer.appendChild(addButton.renderDOM());
        moreReservationsContainer.appendChild(moreReservationsMainContainer);
        addButton.dom.style.marginTop = "5px";

        mainContainer.appendChild(moreReservationsContainer);
        if (reservationsData.length == 0) addButton.onclick(); // if there is no reservation, theres no point in showing this button
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
        daySelector = new DaySelector(true);
        document.body.appendChild(daySelector.renderDOM());

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
        daySelector.updateClasses();
        // open today
        daySelector.selectDay(0);
    })
}

function onLoad(){
    // Check if the extention should run on this url
    if (activeUrl()){
        /*
        TODO
        */
       log = new Log();
        /*
        The settings will handle both the visual interface of the settings,
        as well as holding the data (your current preferences).
        */
        settings = new Settings();
        // /*
        // The clock is a user interface to select a time (for reservations).
        // */
        // clock = new Clock();
        /*
        The tunnel will be an interface between the front-end and the back-end and will perform caching.
        */
        tunnel = new Tunnel();
        // add manifest data for a Progressive Web Application
        configPWA()
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
                document.getElementById("mat-input-0").dispatchEvent(new Event("input"));
                document.getElementById("mat-input-1").value = "(KURT-PRO) Change the details of the reservation.";
                document.getElementById("mat-input-1").dispatchEvent(new Event("input"));

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