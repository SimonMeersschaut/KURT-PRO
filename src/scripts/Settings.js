/*
The settings will handle both the visual interface of the settings,
as well as holding the data (your current preferences).

this.settingsData : {
    "" TODO
}
*/
class Settings{
    constructor(){
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
            const text = document.cookie.split('; ').find(row => row.startsWith('settings='));
            var cookie = null;
            if (text == undefined) return null;
            cookie = text.split('settings=')[1]
            if (!cookie) return null;
    
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
        document.cookie = `settings=${settingsString}; path=/; max-age=31536000`; // 1 year expiration
    }

    /*
    render the popup and put it in the DOM
    */
    showPopup(){
        const settingsData = this.loadSettingsData();
        const popup = new Popup("Settings", `
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
                <label for="settings-Favorite-zones">Favorite zones:</label>
                <div id="settings-Favorite-zones" value="${settingsData.favoriteZones || '(favorite zones)'}">(favorite zones)</div>
            </div>`);
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
}