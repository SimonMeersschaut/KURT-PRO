/*
The build will automatically append css files above using the following format:
A constant variable is made with the name {filename}_css, with the value of the content of the file.
Below is a list of the variables that will be set on build.

homepage_css = ...
day_selector_css = ...
*/

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
    var favoriteZones = fetchFavoriteZones();

    // Create day-selectors
    let onUpdate = (dayIndex) => {
        const d = new Date(Date.now() + dayIndex*( 3600 * 1000 * 24));
        // Clear container
        zoneContainer.innerHTML = "";
        // Load first three favorite zones
        for (var i = 0; i < 3; i++){
            var div = createZoneCard(favoriteZones[i], d);
            zoneContainer.appendChild(div);
        }

    };
    let daySelectors = createDaySelectors(onUpdate);
    document.body.appendChild(daySelectors);
    // Fetch future reservations and update the selectors
    fetchReservations();

    // Create zone container
    var zoneContainer = document.createElement("div")
    document.body.appendChild(zoneContainer);

    // Load the data for day 0 (defualt; today)
    onUpdate(0);
    // Select the first day (visually)
    selectDay(0);
}

document.body.onload = () => {
    // run main
    main();
}