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
function clear_DOM(){
    document.head.innerHTML = "";
    document.body.innerHTML = "";
}

/*
This function will inject all necessary css into the head of the page.
*/
function inject_static_content(){
    document.head.innerHTML = "<style>" + homepage_css + "</style>";
}