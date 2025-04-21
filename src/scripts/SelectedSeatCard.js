class SelectedSeatCard{
    constructor(){
        this.onConfirm = null;
        this.seatId = null
        this.seatNr = null;
    }

    setSeatTime(){
        document.getElementById("seatTime").innerText = `${} - ${}`;
    }

    setSeat(seatNr, seatId){
        this.seatNr = seatNr;
        this.seatId = seatId;
        
        const card = document.getElementById("selectedSeatCard")
        card.style.display = "block";
        document.getElementById("seatTitle").innerText = seatNr;
        document.getElementById("bookSeatConfirm").onclick = (event) => {this.onConfirm(seatNr, seatId)};
        
        this.setSeatTime();
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