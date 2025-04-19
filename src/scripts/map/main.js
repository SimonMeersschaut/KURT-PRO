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
function activateMapScript(){
    // we assume the user is authenticated when the script reaches this point
    clearDOM();
    injectStaticContent("map");

    /* Create custom page. */
    // Get the identifier of the current zone from the URL
    let zoneId = null;
    try{
        zoneId = parseInt(document.URL.split("?")[1].split("zone=")[1].split('&')[0]);
    }
    catch(e){
        throw new Error("ZoneId could not be read from the URL. Make sure the `zone` is an integer.");
    }

    const map = new Map(zoneId, true);
    map.onSelectSeat = (seatId) => {document.getElementById("seatId").innerHTML = seatId.toString()};
    document.body.innerHTML = "<h2 id='seatId'></h2>"+map.renderDOM();
    map.drawSeats();
    return;
}