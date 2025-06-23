class Clock{
    constructor(){
        this.startTime = settings.startTimeHours;
        this.endTime = settings.endTimeHours;
        this.container = null;
        this.onupdate = null;
    }

    renderDOM(){
        this.container = document.createElement("div");
        this.container.id = "timer-preview";
        this.container.className = "btn btn-light clockPreview";
        this.container.onclick = () => {this.showPopup()};
        this.container.innerText = `${this.startTime}:00 - ${this.endTime}:00`;
        return this.container;
    }

    showPopup() {
        this.popup = new Popup("Select a timeslot", `
        <div>
            <select id="start-time-selector" value="10:00" type="text" class="form-select form-select-sm time-selector" aria-label="Small select example"  style="width: 100px; display: inline-block"></select>
            <span>-</span>
            <select id="end-time-selector" value="10:00" type="text" class="form-select form-select-sm time-selector" aria-label="Small select example" style="width: 100px; display: inline-block"></select>
            <br>
            <br>
            <div id="time-selector-week-limit" class="alert alert-light" role="info"></div>
            <br>
            <div id="time-selector-error" class="alert alert-danger" role="alert" style="display: none"> </div>
        </div>    
        `, "Ok");

        // Bind the correct `this` context to the updatePreview method
        this.popup.onclick = () => {
            this.updatePreview();
        };

        this.popup.show();

        // Add times to select tags
        var selector = document.getElementById("start-time-selector");
        selector.onchange = () => {this.updatePreview()};
        // Set time slots for this selector
        for (let t = 8; t <= 24; t++) {
            let option = document.createElement("option");
            option.innerText = `${t}:00`;
            option.value = t;
            option.selected = (t == this.startTime);
            selector.appendChild(option);
        }
        var selector = document.getElementById("end-time-selector");
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
        const dangerAlert = document.getElementById("time-selector-error");
        this.startTime = parseInt( document.getElementById("start-time-selector").value );
        this.endTime = parseInt( document.getElementById("end-time-selector").value );

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

        document.getElementById("timer-preview").innerText = `${this.startTime}:00 - ${this.endTime}:00`;
        if (this.onupdate != null)
            this.onupdate();

        this.updateLimitBadge();
    }

    updateLimitBadge(){
        // update week limit badge
        var weekLimitBadge = document.getElementById("time-selector-week-limit");
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

    show(){
        document.getElementById("timer-preview").style.display = "inline-block";
    }

    hide(){
        document.getElementById("timer-preview").style.display = "none";
    }
}