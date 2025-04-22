class SelectedSeatCard{
    constructor(){
        this.onConfirm = null;
        this.seatId = null
        this.seatNr = null;

        // set defualt start & end time
        this.startTimeHours = settings.getStartTimeHours();
        this.endTimeHours = settings.getEndTimeHours();
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
        document.getElementById("bookSeatConfirm").onclick = (event) => {this.onConfirm(this.seatNr, this.seatId, this.startTimeHours, this.endTimeHours)};
        
        this.updateSeatTime();
    }

    renderDOM(){
        return `
        <div id="selectedSeatCard" class="card" style="display: none">
            <div class="card-body">
                <h2 id="seatTitle"></h2>
                <p id="seatTime">Time: 10:00 - 11:00</p>
                <button id="bookSeatConfirm" class="btn btn-primary">Book seat</button>
            </div>
        </div>`;
    }
}