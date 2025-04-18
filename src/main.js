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
    document.body.appendChild(createDaySelectors());
    

    // Create zone container
    var zoneContainer = document.createElement("div")
    document.body.appendChild(zoneContainer);

    // Load first three favorite zones
    for (var i = 0; i < 3; i++){
        var div = createZoneCard(favoriteZones[i]);
        zoneContainer.appendChild(div);
    }
}

document.body.onload = () => {
    // run main
    main();
}