/*
Each instance represents a UI clock element, on which you can select a start- and end-time.
*/
class Clock{
    constructor(){
        this.startTime = settings.startTimeHours;
        this.endTime = settings.endTimeHours;
        this.dom = null;
        this.popup = null;
        this.onupdate = null;
    }

    renderDOM(){
        this.dom = document.createElement("div");
        this.dom.id = "timer-preview";
        this.dom.className = "btn btn-light clockPreview";
        this.dom.onclick = () => {this.showPopup()};
        this.dom.innerText = `${this.startTime}:00 - ${this.endTime}:00`;
        return this.dom;
    }

    // display text of the button
    setText(text){
        if (text == null){
            this.dom.querySelector("#timer-preview").innerText = `${this.startTime}:00 - ${this.endTime}:00`
            return;
        }
        this.dom.querySelector("#timer-preview").innerText = text;
    }

    showPopup() {
        // Build the popup content using DOM elements instead of a string
        const container = document.createElement("div");

        // Start time selector
        const startSelector = document.createElement("select");
        startSelector.id = "start-time-selector";
        // startSelector.type = "text";
        startSelector.className = "form-select form-select-sm time-selector";
        startSelector.setAttribute("aria-label", "Small select example");
        startSelector.style.width = "100px";
        startSelector.style.display = "inline-block";

        // Separator
        const dash = document.createElement("span");
        dash.innerText = " - ";

        // End time selector
        const endSelector = document.createElement("select");
        endSelector.id = "end-time-selector";
        // endSelector.type = "text";
        endSelector.className = "form-select form-select-sm time-selector";
        endSelector.setAttribute("aria-label", "Small select example");
        endSelector.style.width = "100px";
        endSelector.style.display = "inline-block";

        // Line breaks
        const br1 = document.createElement("br");
        const br2 = document.createElement("br");

        // Week limit badge
        const weekLimitDiv = document.createElement("div");
        weekLimitDiv.id = "time-selector-week-limit";
        weekLimitDiv.className = "alert alert-light";
        weekLimitDiv.setAttribute("role", "info");

        // Another line break
        const br3 = document.createElement("br");

        // Error alert
        const errorDiv = document.createElement("div");
        errorDiv.id = "time-selector-error";
        errorDiv.className = "alert alert-danger";
        errorDiv.setAttribute("role", "alert");
        errorDiv.style.display = "none";

        // Assemble the container
        container.appendChild(startSelector);
        container.appendChild(dash);
        container.appendChild(endSelector);
        container.appendChild(br1);
        container.appendChild(br2);
        container.appendChild(weekLimitDiv);
        container.appendChild(br3);
        container.appendChild(errorDiv);

        this.popup = new Popup("Select a timeslot", container, "Ok");

        // Bind the correct `this` context to the updatePreview method
        this.popup.onclick = () => {
            this.updatePreview();
        };

        this.popup.show();

        // Add times to select tags
        var selector = startSelector;
        selector.onchange = () => {this.updatePreview()};
        // Set time slots for this selector
        for (let t = 8; t <= 24; t++) {
            let option = document.createElement("option");
            option.innerText = `${t}:00`;
            option.value = t;
            option.selected = (t == this.startTime);
            selector.appendChild(option);
        }
        var selector = endSelector;
        selector.onchange = () => {this.updatePreview()};
        // Set time slots for this selector
        for (let t = 8; t <= 24; t++) {
            let option = document.createElement("option");
            option.innerText = `${t}:00`;
            option.value = t;
            option.selected = (t == this.endTime);
            selector.appendChild(option);
        }

        this.updateLimitBadge();
    }

    updatePreview(){
        const dangerAlert = this.popup.dom.querySelector("#time-selector-error");
        this.startTime = parseInt( this.popup.dom.querySelector("#start-time-selector").value );
        this.endTime = parseInt( this.popup.dom.querySelector("#end-time-selector").value );

        if (this.startTime > this.endTime){
            dangerAlert.innerText = "The start time was later than the end time, which is not valid.";
            dangerAlert.style.display = "inline-block";
            return;
        }
        if (this.startTime == this.endTime){
            dangerAlert.innerText = "The start time is equal to the end time, which is not valid. Please choose a different time.";
            dangerAlert.style.display = "inline-block";
            return;
        }

        // remove any alert text
        dangerAlert.innerText = "";
        dangerAlert.style.display = "none";

        settings.startTimeHours = this.startTime;
        settings.endTimeHours = this.endTime;


        this.dom.innerText = `${this.startTime}:00 - ${this.endTime}:00`;
        if (this.onupdate != null)
            this.onupdate();

        this.updateLimitBadge();
    }

    updateLimitBadge(){
        // update week limit badge
        var weekLimitBadge = this.popup.dom.querySelector("#time-selector-week-limit");
        tunnel.getUssage()
        .then((usage) => {
            // calculate delta time
            const delta = this.endTime - this.startTime;
            if (usage > 48){
                // error, should not be possible
                throw new Error("The current usage exceeds 48 hours.")
            }
            // else if (delta > 16){
            //     // this would exceed the (day) limit
            //     weekLimitBadge.classList.remove("alert-light");
            //     weekLimitBadge.classList.add("alert-warning");
            //     weekLimitBadge.innerText = `Usage: ${usage}/48 -> ${usage+delta}/48
            //     Exceeds limit 16 per day.`;
            // }
            else if (usage + delta > 48){
                // this would exceed the limit
                weekLimitBadge.classList.remove("alert-light");
                weekLimitBadge.classList.add("alert-warning");
                weekLimitBadge.innerText = `Week usage: ${usage}/48 -> ${usage+delta}/48\nExceeds week limit.`;
            }
            else{
                // OK
                weekLimitBadge.classList.remove("alert-warning");
                weekLimitBadge.classList.add("alert-light");
                weekLimitBadge.innerText = `Week usage: ${usage}/48 -> ${usage+delta}/48`;
            }
            
            }
        );
    }

    hide(){
        this.dom.style.display = "none";
    }

    show(){
        this.dom.style.display = "inline-block";
    }

    disable(){
        this.dom.classList.add("disabled");
    }

    enable(){
        this.dom.classList.remove("disabled");
    }
}