/*
The settings will handle both the visual interface of the settings,
as well as holding the data (your current preferences).

this.settingsData : {
    "startTime": 10,
    "endTime": 16
}
*/
class Settings{
    constructor(){
        // constant variables
        this.SETTINGS_CNAME = "KURT_PRO_SETTINGS";
        this.FAVORITE_ZONES_CNAME = "KURT_PRO_FAVORITE_ZONES";
        this.EXDAYS = 356;
        // initialize the cache
        this._settingsData = null;
    }

    /*
    Load the settings from cookies.
    */
    get settingsData() {
        if (this._settingsData == null){
            // not fetched yet, load it from the cookies
            // Retrieve the settings cookie
            // get cookie value
            const cookie = getCookie(this.SETTINGS_CNAME);
            if (cookie == "") return null;
    
            // Extract and decode the settings string
            const pairs = cookie.split('&');
            var entries = [];
            pairs.forEach(pair => {
                const [key, value] = pair.split('=');
                entries.push([key, decodeURIComponent(value)]);
            });
            this._settingsData = Object.fromEntries(entries);
        }
        return this._settingsData;
    }

    /*
    Update the settings data (both in cache and in storage).
    */
    set settingsData(value){
        // First, update the cached value
        this._settingsData = value;
        // Now update the cookies
        // Convert the dictionary to a string with '&' and '='
        const settingsString = Object.entries(this._settingsData)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        // Save the string in cookies
        setCookie(
            this.SETTINGS_CNAME,
            settingsString,
            this.EXDAYS
        );
    }

    /*
    render the popup and put it in the DOM
    */
    openSettingsPage(){
        const popup = new Popup("Settings", this.renderDOM());
        popup.onclick = () => {daySelector.selectDay(0)}
        popup.show();
    }

    /*
    GETTERS AND SETTERS
    */

    
    get startTimeHours() {
        return parseInt( this.settingsData?.startTime !== undefined ? this.settingsData.startTime : 10 );
    }

    set startTimeHours(value) {
        this.settingsData = { ...this.settingsData, startTime: value };
    }

    get endTimeHours() {
        return parseInt( this.settingsData?.endTime !== undefined ? this.settingsData.endTime : 18 );
    }

    set endTimeHours(value) {
        this.settingsData = { ...this.settingsData, endTime: value };
    }

    /*
    This function will return the favorite zones of this user in order.
    */
    getFavoriteZoneIds(){
        function parseString(value){
            const result = value.split(",").map(x => parseInt(x));

            if (result.some(x => (x == undefined || isNaN(x)))) // if the wrong format was read, parseInt will return NaN
                throw new Error("Error reading favorite zone cookies.");
            
            return result;
        }

        const defaultValue = "2"; // Silent Study 2
        const cookie = getCookie(this.FAVORITE_ZONES_CNAME);

        if (cookie == ""){
            this.setFavoriteZones(defaultValue);
            return parseString(defaultValue);
        }
        try{
            return parseString(cookie);
        }catch(e){
            // Unexpected non-whitespace character after JSON at position 62 (line 1 column 63)
            this.setFavoriteZones(defaultValue);
            log.error(e);
            return parseString(defaultValue);
        }
    }

    /**
     * returns {"uid":r-number,"email":email}
     */
    async getUser(){
        const data = await tunnel.getAccountInfo();
        return {
            "uid": data["uid"],
            "email": data["email"],
        };
    }

    setFavoriteZones(value){
        setCookie(
            this.FAVORITE_ZONES_CNAME,
            value,
            this.EXDAYS
        );
    }

    renderDOM(){
        let container = document.createElement("div");
        
        // exit kurt-pro
        let exitButton = document.createElement("button");
        exitButton.innerText = "Exit KURT-PRO";
        exitButton.className = "btn btn-outline-secondary";
        exitButton.onclick = () => {window.location.assign("/")};
        container.appendChild(exitButton);


        // favorite zones
        let label = document.createElement("h6");
        label.innerText = "Favorite zones:";
        container.appendChild(label);

        container.appendChild(document.createElement("br"));

        // draw all zone selectors
        var selectedZones = this.getFavoriteZoneIds();
        for (let i=0; i<ALL_ZONES.length; i++){
            // selectionButton
            let selectionButton = document.createElement("input");
            selectionButton.type = "checkbox";
            selectionButton.className = "form-check-input mt-0";
            // is checked:
            let selected = selectedZones.some( (item) => item == ALL_ZONES[i]["zoneId"] );
            selectionButton.checked = selected;
            container.appendChild(selectionButton);
            // event listener (click)
            selectionButton.onchange = (ev) => {
                let isChecked = ev.target.checked;
                if (isChecked){
                    // add to favorites
                    selectedZones.push(ALL_ZONES[i]["zoneId"]);
                    this.setFavoriteZones(selectedZones.join(","));
                }
                else{
                    // check if selection is valid
                    if (selectedZones.length <= 1){
                        // not valid, reselect
                        ev.target.checked = true;
                    }
                    else{
                        // remove from favorites
                        const index = selectedZones.indexOf(ALL_ZONES[i]["zoneId"]);
                        selectedZones.splice(index, 1);
                        this.setFavoriteZones(selectedZones.join(","));
                    }
                }
            }
            
            let zoneLabel = document.createElement("label");
            zoneLabel.innerText = ALL_ZONES[i]["name"];
            container.appendChild(zoneLabel);

            container.appendChild(document.createElement("br"));
        }

        container.appendChild(document.createElement("br"));

        return container;
    }
}