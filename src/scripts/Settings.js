/*
The settings will handle both the visual interface of the settings,
as well as holding the data (your current preferences).

this.settingsData : {
    "" TODO
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
        // const settingsData = this.loadSettingsData();
        const popup = new Popup("Settings", `
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
                <label for="settings-Favorite-zones">Favorite zones:</label>
                <br />
                <button class="btn btn-outline-secondary" onclick="window.location.assign('/')"> Exit KURT-PRO</button>
            </div>`);
        //<div id="settings-Favorite-zones" value="${settingsData.favoriteZones || '(favorite zones)'}">(favorite zones)</div>
        popup.show();
        popup.onclick = () => {this.saveSettingsData()};

        document.getElementById("settings-time-selector").appendChild(this.clock.renderDOM());
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
    getFavoriteZones(){
        const defaultValue = [
            {"locationId": 10, "zoneId": 2, "name": "Agora - Silent study 2"},
            {"locationId": 10, "zoneId": 1, "name": "Agora - Silent study 1"},
            {"locationId": 1, "zoneId": 11, "name": "Arenberg - De boekenzaal"},
            {"locationId": 1, "zoneId": 10, "name": "Arenberg - Leeszaal"},
            {"locationId": 1, "zoneId": 14, "name": "Arenberg - De zolder"},
            {"locationId": 1, "zoneId": 8, "name": "Arenberg - Kelder"},
        ];
        // const cookie = getCookie(this.FAVORITE_ZONES_CNAME);
        // if (cookie == ""){
        //     this.setFavoriteZones(defaultValue);
        //     return defaultValue;
        // }
        // try{
        //     return JSON.parse(cookie);
        // }catch(e){
        //     // Unexpected non-whitespace character after JSON at position 62 (line 1 column 63)
        //     this.setFavoriteZones(defaultValue);
        // }
        return defaultValue;
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
            JSON.stringify(value),
            this.EXDAYS
        );
    }

    renderDOM(){
        const button = document.createElement("button");
        button.innerText = "Settings";
        button.onclick = this.openSettingsPage;
        button.classList.add("btn");
        button.classList.add("btn-light");
        button.id = "settings-button";
        return button;
    }

    // (){
    //     const popup = new Popup("Settings", "<h3>Not implemented yet...</h3>", "Save");
    //     popup.show();
    // }

}