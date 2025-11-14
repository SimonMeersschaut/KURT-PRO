/*
This function will make sure the user is authenticated and will return wether he succeeded in doing so.
*/
async function enforceAuthentication(){
    try{
        const response = await fetch("api/information")
        const data = await response.json();
        
        if(response.ok){
            document.cookie = `email=${data.email}; path=/`;
            document.cookie = `uid=${data.uid}; path=/`;
        }
        
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


function inject(){
    if (!document.getElementById('root')) {{
        const rootDiv = document.createElement('div');
        rootDiv.id = 'root';
        document.body.appendChild(rootDiv);
    }}

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = "{CSS_CONTENT}";
    document.head.appendChild(style);

    // Inject JS
    console.log("Injecting js.");
    {JS_CONTENT}
}


function main(){
    if (document.location.href.endsWith("#kurt-pro")){
        enforceAuthentication()
        .then(success => {
            if (!success){
                throw new Error("User could not be authenticated.");
            }
            // we assume the user is authenticated when the script reaches this point
            clearDOM();
            inject();
        });
    }
}


main();