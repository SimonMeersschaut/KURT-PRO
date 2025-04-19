/*
The build will automatically append css files above using the following format:
A constant variable is made with the name {filename}_css, with the value of the content of the file.
Below is a list of the variables that will be set on build.

homepage_css = ...
day_selector_css = ...
*/

/*
This function will clear the DOM and inject the custom homepage.
*/
function activateHomePageScript(){
    // we assume the user is authenticated when the script reaches this point
    clearDOM();
    injectStaticContent();
    
    /* Create custom page. */
    // Fetch favorite zones of the user
    var favoriteZones = fetchFavoriteZones();
    
    // Create day-selectors
    var daySelector = new DaySelector(true);
    document.body.appendChild(daySelector.renderDOM());
    // set onclick event listener
    daySelector.onClickDay = (dayIndex) => {
        /* Load zones with availability. */
        const d = new Date(Date.now() + dayIndex*( 3600 * 1000 * 24));
        // Clear container
        zoneContainer.innerHTML = "";
        // Load first three favorite zones
        for (var i = 0; i < 3; i++){
            var div = createZoneCard(favoriteZones[i], d);
            zoneContainer.appendChild(div);
        }
    }

    // Fetch future reservations and update the selectors
    daySelector.fetchReservations()

    // Create zone container
    var zoneContainer = document.createElement("div")
    document.body.appendChild(zoneContainer);
}
