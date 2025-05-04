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
            <div id="time-selector-error" class="alert alert-danger" role="alert">
            A simple danger alert—check it out!
            </div>
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
        for (let t = 8; t < 24; t++) {
            let option = document.createElement("option");
            option.innerText = `${t}:00`;
            option.value = t;
            option.selected = (t == this.startTime);
            selector.appendChild(option);
        }
        var selector = document.getElementById("end-time-selector");
        selector.onchange = () => {this.updatePreview()};
        // Set time slots for this selector
        for (let t = 8; t < 24; t++) {
            let option = document.createElement("option");
            option.innerText = `${t}:00`;
            option.value = t;
            option.selected = (t == this.endTime);
            selector.appendChild(option);
        }
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
    }
}