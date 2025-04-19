/*
The build will automatically append css files above using the following format:
A constant variable is made with the name {filename}_css, with the value of the content of the file.
Below is a list of the variables that will be set on build.

homepage_css = ...
day_selector_css = ...
map_css = ...
*/

function main(){
    /* Setup & Initialize the webpage */
    var success = enforceAuthentication();
    if (!success){
        throw new Error("User could not be authenticated.");
    }
    // get the current path
    const path = document.URL.split("https://kurt3.ghum.kuleuven.be/")[1]
    
    if (path == ""){
        // Home page
        activateHomePageScript();
    }
    else if(path.split("/")[0] == 'locations' && path.split("?")[1].split("=")[0] == "zone"){
        // Map
        activateMapScript();
    }
    
}

// Call the main function when the entire page was loaded
document.body.onload = () => {
    // run main
    main();
}