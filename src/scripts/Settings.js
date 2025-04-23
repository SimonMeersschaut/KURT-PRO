/*
The settings will handle both the visual interface of the settings,
as well as holding the data (your current preferences).
*/
class Settings{
    constructor(){

    }

    getStartTimeHours(){
        return 10;
    }

    getEndTimeHours(){
        return 18;
    }

    /*
    Save the entered settings.
    */
    saveSettingsData() {
        // Read settings
        const settingsData = {
            rNumber: document.getElementById("settings-rnumber").value,
            email: document.getElementById("settings-email").value,
            defaultTime: document.getElementById("settings-default-time").textContent,
            favoriteZones: document.getElementById("settings-Favorite-zones").textContent
        };

        // Convert the dictionary to a string with '&' and '='
        const settingsString = Object.entries(settingsData)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        // Save the string in cookies
        document.cookie = `settings=${settingsString}; path=/; max-age=31536000`; // 1 year expiration

        console.log("Saved Settings to Cookies:", settingsString);
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
        console.log(cookie)
        const pairs = cookie.split('&');
        var entries = [];
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            entries.push([key, decodeURIComponent(value)]);
        });

        const settingsData = Object.fromEntries(entries);

        console.log("Loaded Settings from Cookies:", settingsData);
        return settingsData;
    }

    /*
    render the popup and put it in the DOM
    */
    showPopup() {
        // Create container
        const container = document.createElement("div");
        container.innerHTML = this.renderPopup();
        document.body.appendChild(container);

        // Get the modal element
        const modalElement = document.getElementById("exampleModal");

        // Load settings and populate the modal fields
        const settingsData = this.loadSettingsData();
        if (settingsData) {
            document.getElementById("settings-rnumber").value = settingsData.rNumber || '';
            document.getElementById("settings-email").value = settingsData.email || '';
            document.getElementById("settings-default-time").textContent = settingsData.defaultTime || '(default time)';
            document.getElementById("settings-Favorite-zones").textContent = settingsData.favoriteZones || '(favorite zones)';
        }

        // Show the modal by adding Bootstrap's "show" and "modal-backdrop" classes
        modalElement.classList.add("show");
        modalElement.style.display = "block";

        // Create and append a backdrop
        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop fade show";
        document.body.appendChild(backdrop);

        // Close the modal when the close button or backdrop is clicked
        const closeModal = () => {
            this.saveSettingsData();
            modalElement.classList.remove("show");
            modalElement.style.display = "none";
            backdrop.remove();
            container.remove();
        };

        // Save data when the "Save changes" button is clicked
        const saveButton = modalElement.querySelector(".btn-primary");
        saveButton.addEventListener("click", () => {
            this.saveSettingsData();
            closeModal();
        });

        modalElement.querySelector(".btn-close").addEventListener("click", closeModal);
        modalElement.querySelector("[data-bs-dismiss='modal']").addEventListener("click", closeModal);
        backdrop.addEventListener("click", closeModal);
    }

    renderPopup(){
        return `
        <div class="modal fade" id="exampleModal">
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Settings</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="settings-body">
                    <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
                        <label for="settings-rnumber">R Number:</label>
                        <input id="settings-rnumber" type="text"/>
                        
                        <label for="settings-email">Email:</label>
                        <input id="settings-email" type="email"/>
                        
                        <label for="settings-default-time">Default Time:</label>
                        <div id="settings-default-time">(default time)</div>
                        
                        <label for="settings-Favorite-zones">Favorite zones:</label>
                        <div id="settings-Favorite-zones">(favorite zones)</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary">Save changes</button>
                </div>
                </div>
            </div>
        </div>`;
    }
}