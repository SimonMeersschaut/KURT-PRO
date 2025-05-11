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
        console.error(e);
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
ERROR HANDLING
*/

function handleGlobalError(error) {
    console.error("Global Error Caught:", error);

    const errorMessage = error.message || "An unknown error occurred.";
    const errorName = error.name || "Error";

    const popup = new Popup(
        `KURT-PRO encountered a ${errorName}.`,
        errorMessage,
        "Close"
    );
    popup.show();
}

// Attach global error handlers
window.onerror = (message, source, lineno, colno, error) => {
    handleGlobalError(error || new Error(message));
};

window.onunhandledrejection = (event) => {
    handleGlobalError(event.reason || new Error("Unhandled promise rejection"));
};