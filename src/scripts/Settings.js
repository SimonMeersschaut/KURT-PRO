/*
The settings will handle both the visual interface of the settings,
as well as holding the data (your current preferences).
*/
class Settings{
    constructor(){
        this.clock = new Clock();
        // load data
        const settingsData = this.loadSettingsData();
        if (!settingsData) {
            throw new Error("Unexpected: `settingsData` was not defined.")
        }
        this.clock.startTime = parseInt(settingsData.defaultTime.split('.')[0]);
        this.clock.endTime = parseInt(settingsData.defaultTime.split('.')[1]);
    }

    getStartTimeHours(){
        if (this.clock == null)
            throw new Error("`clock` is `null`.")
        return this.clock.startTime;
    }

    getEndTimeHours(){
        if (this.clock == null)
            throw new Error("`clock` is `null`.")
        return this.clock.endTime;
    }

    /*
    Save the entered settings.
    */
    saveSettingsData() {
        if (this.clock == null)
            throw new Error("`clock` is `null`.")
        // Read settings
        const settingsData = {
            rNumber: document.getElementById("settings-rnumber").value,
            email: document.getElementById("settings-email").value,
            defaultTime: `${this.clock.startTime}.${this.clock.endTime}`,
            favoriteZones: document.getElementById("settings-Favorite-zones").textContent
        };

        // Convert the dictionary to a string with '&' and '='
        const settingsString = Object.entries(settingsData)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        // Save the string in cookies
        document.cookie = `settings=${settingsString}; path=/; max-age=31536000`; // 1 year expiration

    }

    /*
    Load the settings from cookies.
    */
    loadSettingsData() {
        // Retrieve the settings cookie
        // get cookie value
        const cookie = document.cookie.split('; ').find(row => row.startsWith('settings=')).split('settings=')[1];
        if (!cookie) return null;

        // Extract and decode the settings string
        const pairs = cookie.split('&');
        var entries = [];
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            entries.push([key, decodeURIComponent(value)]);
        });

        const settingsData = Object.fromEntries(entries);

        return settingsData;
    }

    /*
    render the popup and put it in the DOM
    */
    showPopup(){
        const settingsData = this.loadSettingsData();
        const popup = new Popup("Settings", `
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">

                <label for="settings-rnumber">R Number:</label>
                <div class="input-group mb-3">
                    <span class="input-group-text">r</span>
                    <input id="settings-rnumber" type="text" class="form-control" aria-label="Your student number." value="${settingsData.rNumber || ''}">
                </div>
                
                <label for="settings-email">Email:</label>
                <div class="input-group mb-3">
                    <input id="settings-email" type="text" class="form-control" placeholder="Your email adress." value="${settingsData.email || ''}" aria-label="Users student email" aria-describedby="basic-addon2">
                    <span class="input-group-text" id="basic-addon2">@student.kuleuven.be</span>
                </div>
                
                <label for="settings-default-time">Default Time:</label>
                <div id="settings-time-selector"></div>
                <div id="settings-default-time" value="${settingsData.defaultTime || '(default time)'}">(default time)</div>
                
                <label for="settings-Favorite-zones">Favorite zones:</label>
                <div id="settings-Favorite-zones" value="${settingsData.favoriteZones || '(favorite zones)'}">(favorite zones)</div>
            </div>`);
        popup.show();
        popup.onclick = () => {this.saveSettingsData()};

        document.getElementById("settings-time-selector").appendChild(this.clock.renderDOM());
    }
}