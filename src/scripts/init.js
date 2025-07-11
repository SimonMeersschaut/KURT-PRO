/*
This file initializes the extention (clearing the page, injecting content, handling errors etc.).
*/


const BOOTSTRAP_CDN = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" crossorigin="anonymous">    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js" integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq" crossorigin="anonymous"></script>';

/*
This function will make sure the user is authenticated and will return wether he succeeded in doing so.
*/
async function enforceAuthentication(){
    try{
        const response = await fetch("api/information")
        // const data = response.json();
        return response.ok;
    }
    catch(e){
        log.error(e);
        return false;
    }
}

/*
Removes all the present content of the page.
*/
function clearDOM(){
    document.head.innerHTML = "";
    document.body.innerHTML = "";
}

/*
This function will inject all necessary css into the head of the page.

page:
    - "homepage" => 
    - "map" =>
*/
function injectStaticContent(){
    // homepage
    document.head.innerHTML = 
    "<style>" + main_css + "</style>"
    + "<style>" + homepage_css + "</style>"
    + "<style>" + zone_card_css + "</style>"
    + "<style>" + day_selector_css + "</style>"
    + "<style>" + map_css + "</style>"
    + "<style>" + loader_css + "</style>"
    + "<style>" + clock_css + "</style>"
    + BOOTSTRAP_CDN;
}

/*
Returns if the extention should execute on this url.
*/
function activeUrl(){
    return window.location.hash == "#kurt-pro";
}

/*
Returns if the browser's location is a url to change the reservation details.
*/
function isChangeReservationUrl(){
    // pathname example: "/edit-reservation/3961023370"
    return window.location.pathname.split("/")[1] == "edit-reservation";
}


const dateToString = (date) => {
    if (!(date instanceof Date))
        throw new Error("`date` was not a `Date` object.");
    return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
};

/*
Set a cookie by name, value and expire-days.
*/
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/*
Get a cookie by name.
*/
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
    ---- ERROR HANDLING ----
*/


/*
Handler for a global error.
Will pass the error to a log object.
*/
function handleGlobalError(error) {
    log.error("Global Error Caught:", error);

    // const errorMessage = error.message || "An unknown error occurred.";
    // const errorName = error.name || "Error";
}

// Attach global error handlers
window.onerror = (message, source, lineno, colno, error) => {
    handleGlobalError(error || new Error(message));
};

window.onunhandledrejection = (event) => {
    handleGlobalError(event.reason || new Error("Unhandled promise rejection"));
};

