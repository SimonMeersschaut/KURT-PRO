const BOOTSTRAP_CDN = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" crossorigin="anonymous">    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js" integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq" crossorigin="anonymous"></script>';

/*
This function will make sure the user is authenticated and will return wether he succeeded in doing so.
*/
function enforceAuthentication(){
    // After some testing, I concluded that this script only runs when the user is already authenticated.
    // Thus, no checks are performed in this function.
    // This function is simply there to allow future checks.
    return true;
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
    document.head.innerHTML = "<style>" + homepage_css + "</style>" + "<style>" + day_selector_css + "</style>" + BOOTSTRAP_CDN;
}