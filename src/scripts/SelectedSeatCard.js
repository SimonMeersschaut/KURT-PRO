class SelectedSeatCard{
    constructor(button = true, buttonText = "Confirm"){
        this.button = button;
        this.buttonText = buttonText;
        this.onClick = null;
        this.seatId = null
        this.seatNr = null;

        // set defualt start & end time
        this.startTimeHours = settings.startTimeHours;
        this.endTimeHours = settings.endTimeHours;
    }

    updateSeatTime(){
        document.getElementById("seatTime").innerText = `${this.startTimeHours}:00 - ${this.endTimeHours}:00`;
    }

    setSeat(seatNr, seatId){
        this.seatNr = seatNr;
        this.seatId = seatId;
        
        const card = document.getElementById("selectedSeatCard")
        card.style.display = "block";
        document.getElementById("seatTitle").innerText = seatNr;
        if (this.button)
            if (this.onClick == null)
                throw new Error("`onClick` was `nulll` for the selectedSeatCard.");
            document.getElementById("bookSeatConfirm").onclick = (event) => {this.onClick(this.seatNr, this.seatId, this.startTimeHours, this.endTimeHours)};
        
        this.updateSeatTime();
    }

    renderDOM(){
        return `
        <div id="selectedSeatCard" class="card" style="display: none">
            <div class="card-body">
                <h2 id="seatTitle"></h2>
                <p id="seatTime">Time: 10:00 - 11:00</p>
                ${this.button ? '<button id="bookSeatConfirm" class="btn btn-primary">' + this.buttonText + '</button> ' : ''}
            </div>
        </div>`;
    }
}