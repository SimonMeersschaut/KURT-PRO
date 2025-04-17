/*
The build will automatically append css files above using the following format:
A constant variable is made with the name {filename}_css, with the value of the content of the file.
Below is a list of the variables that will be set on build.

homepage_css = ...
*/

function main(){
    /* Setup & Initialize the webpage */
    var success = enforceAuthentication();
    if (!success){
        throw new Error("User could not be authenticated.");
    }
    // we assume the user is authenticated when the script reaches this point
    clear_DOM();
    inject_static_content();
    
    /* Create custom page. */
    // Fetch favorite zones of the user
    var favorite_zones = fetch_favorite_zones();

    // Create zone container
    var zone_container = document.createElement("div")
    document.body.appendChild(zone_container);

    // Load first three favorite zones
    for (var i = 0; i < 3; i++){
        var div = create_zone_card(favorite_zones[i]);
        zone_container.appendChild(div);
    }
}

main();