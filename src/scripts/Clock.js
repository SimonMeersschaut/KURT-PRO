class Clock{
    constructor(){
        this.startTime = settings.startTimeHours;
        this.endTime = settings.startTimeHours;
        this.container = null;
        this.onupdate = null;
    }

    getPreviewText(){
        return `${this.startTime}:00 - ${this.endTime}:00`;
    }

    renderDOM(){
        this.container = document.createElement("div");
        this.container.id = "timer-preview";
        this.container.className = "btn btn-light clockPreview";
        this.container.onclick = () => {this.showPopup()};
        this.container.innerText = this.getPreviewText();
        return this.container;
    }

    showPopup() {
        this.popup = new Popup("Select a timeslot", `
        <div>
            <select id="start-time-selector" value="10:00" type="text" class="form-select form-select-sm time-selector" aria-label="Small select example" style="width: 100px; display: inline-block"></select>
            <span>-</span>
            <select id="end-time-selector" value="10:00" type="text" class="form-select form-select-sm time-selector" aria-label="Small select example" style="width: 100px; display: inline-block"></select>
        </div>    
        `, "Ok");

        // Bind the correct `this` context to the updatePreview method
        this.popup.onclick = () => {
            this.updatePreview();
        };

        this.popup.show();

        // Add times to select tags
        var selector = document.getElementById("start-time-selector");
        // Set time slots for this selector
        for (let t = 8; t < 24; t++) {
            let option = document.createElement("option");
            option.innerText = `${t}:00`;
            option.value = t;
            option.selected = (t == this.startTime);
            selector.appendChild(option);
        }
        var selector = document.getElementById("end-time-selector");
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
        this.startTime = document.getElementById("start-time-selector").value;
        this.endTime = document.getElementById("end-time-selector").value;
        document.getElementById("timer-preview").innerText = this.getPreviewText();
        if (this.onupdate != null)
            this.onupdate();
    }
}