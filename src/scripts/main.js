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

// TODO: docs and split code
// TODO: change `d` to selectedDay.
function selectDay(dayIndex, mainContainer){
    // Fetch favorite zones of the user
    var favoriteZones = tunnel.getFavoriteZones()
    //
    const d = new Date(new Date().getTime() + dayIndex * _MS_PER_DAY);
    tunnel.hasReservationOn(dayIndex)
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
                zoneCard.fetchAvailability(d);
                zoneCard.onclick = (zoneId) => {
                    mapLoader = new Loader("Loading map");
                    // Show all available seats
                    mainContainer.innerHTML = "";
                    var map = new Map(2, true);
                    var selectedSeatCard = new SelectedSeatCard();
                    mainContainer.innerHTML = "<div>" + map.renderDOM() + "</div>" + selectedSeatCard.renderDOM();
                    map.onSelectSeat = (seatId) => {selectedSeatCard.setSeat(seatId)};
                    selectedSeatCard.onConfirm = bookSeat; // effectively book that seat
                    tunnel.fetchMapData(2)
                    .then(mapData => {
                        map.drawSeats(mapData);
                    })
                    .then(() => {
                        (async () => {
                            var timeout = 40; // ms between seats opening up
                            const freeSeatGenerator = tunnel.freeSeats(10, zoneId, d);
                            const seatQueue = [];
                            let isProcessing = false;
                    
                            const processQueue = async () => {
                                if (isProcessing) return;
                                isProcessing = true;
                    
                                while (seatQueue.length > 0) {
                                    const freeSeat = seatQueue.shift();
                                    document.getElementById(`plaats-${freeSeat}`).classList.add("free");
                                    await new Promise(resolve => setTimeout(resolve, timeout));
                                }
                                mapLoader.stop();
                                isProcessing = false;
                            };
                    
                            while (true) {
                                const { value: freeSeat, done } = await freeSeatGenerator.next();
                                if (done || freeSeat === undefined) {
                                    // all seats are now available -> show them immediatly
                                    processQueue(); // for edge case: 0 seats available (loader would spin infinitely)
                                    timeout = 0;
                                    break;
                                }
                    
                                seatQueue.push(freeSeat);
                                processQueue();
                            }
                        })();
                    })
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

    // const loader = new Loader('example');

    // // Simulate a loading process
    // setTimeout(() => {
    //     loader.success(); // Trigger the success animation
    // }, 3000);
}